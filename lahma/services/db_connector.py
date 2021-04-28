#!/usr/bin/python3
import mysql.connector as mariadb
import concurrent.futures
from flask import json
#import json
import os
from lahma import app

class IdNotFoundError(ValueError):
    pass

class NoProteinError(ValueError):
    pass

class CalphaTraceError(ValueError):
    pass

def query_database(pdb_id):
    """
    Fetches data from the SQL database supporting the homology-based annotation and returns it in a format suitable for
    visualization on the main page of the LAHMA website.

    is_in_pdb is a boolean to determine if it was user-defined or not: if so, the query data is retrieved from JSON
    files instead of the database.
    """
    connection = mariadb.connect(user=app.config['DB_USERNAME'], password=app.config['DB_PASSWORD'], host=app.config['DB_IP'], database=app.config['DB_NAME'])
    cursor = connection.cursor()
    
    #retrieve information: start with finding all chains
    cursor.execute("SELECT DISTINCT chain "
                   "FROM Residue "
                   "WHERE pdbid = '" + pdb_id + "';")
    chain_rows = cursor.fetchall()
    #find out if there is a warning specifically for this entry
    cursor.execute("SELECT message "
                   "FROM Warning "
                   "WHERE pdbid = '" + pdb_id + "';")
    warning_rows = cursor.fetchall()
 
    #If nothing is found, return error
    if not chain_rows and not warning_rows:
        raise IdNotFoundError

    #define warnings
    warnings = []
    if warning_rows:
        warnings = [w[0] for w in warning_rows]
    for w in warnings:
        if w == "No protein detected":
            raise NoProteinError
        elif w == "Only C-alpha-trace of protein present":
            raise CalphaTraceError
 
    #if no residues are found, but only warnings, return the warning
    if not chain_rows:
        return warnings, []
 
    #all checks passed: data should be present. Find all chains
    chains = []
    for row in chain_rows:
        chains.append(row[0])
     
    #fetch also NCS information from the database.
    cursor.execute("SELECT chain, ncschain "
                   "FROM NCSInfo "
                   "WHERE pdbid = '" + pdb_id + "';")
    ncs_rows = cursor.fetchall()
    ncs_data = []
    #Return a list that shows which chains can be mapped to which other chains
    ncs_chains_dealt_with = []
    if ncs_rows:
        for row in ncs_rows:
            #check if the first chain is already identified before, if so add to NCS copies of that chain
            identified_before = False
            for elem in ncs_data:
                if elem[0] == row[0]:
                    identified_before = True
                    elem[1] = elem[1] + row[1]
                    ncs_chains_dealt_with.append(row[1])
            if not identified_before:
                ncs_data.append([row[0], row[1]])
                ncs_chains_dealt_with.append(row[0])
                ncs_chains_dealt_with.append(row[1])
    for chain in chains:
        if not chain in ncs_chains_dealt_with:
            ncs_data.append([chain, ''])
 
    #find all the data per chain (multiprocessed)
    output = []

    for chain in chains:
        result = run_chain(chain, pdb_id)
        output.append(result)

    # finally, find the number of homologous chains on which annotation is based
    select_num_homol_stmt = "SELECT "
    is_first = True
    for chain in chains:
        if not is_first:
            select_num_homol_stmt += ", "
        select_num_homol_stmt += "CAST(SUM(CASE WHEN chain='" + chain + "' THEN 1 ELSE 0 END) AS CHAR) AS " + chain
        is_first = False
    select_num_homol_stmt += " FROM HomolMap WHERE pdbid='" + pdb_id + "';"
    cursor.execute(select_num_homol_stmt)
    num_homologs_data = cursor.fetchall()
    num_homologs = []
    for i in range(0, len(chains)):
        if num_homologs_data[0][i]:
            num_homologs.append(num_homologs_data[0][i])
        else:
            num_homologs.append(0)

    connection.close()

    return warnings, ncs_data, output, num_homologs

def read_json_files(pdb_id, json_dir):
    """"
    get the data via JSON files instead of via the database
    """
    file_name_base = json_dir
    if not file_name_base.endswith('/'):
        file_name_base += '/'
    file_name_base += pdb_id
    with open(file_name_base + "_main_page.json", 'r') as f:
        main_data = json.load(f)
    chains = []
    for chain_data in main_data:
        chains.append(chain_data['ChainID'])
    warnings =[]
    warning_file = file_name_base + "_warnings.json"
    if os.path.exists(warning_file) and os.path.getsize(warning_file) > 0:
        with open(warning_file, 'r') as f:
            warnings = json.load(f)
    with open(file_name_base + "_homol_map.json", 'r') as f:
        homol_data = json.load(f)
    num_homologs = []
    for chain in chains:
        num_hom = 0
        if isinstance(homol_data, list):
            for homol in homol_data:
                if homol['chain'] == chain:
                    num_hom += 1
        num_homologs.append(num_hom)
    ncs_file = file_name_base + "_ncs_info.json"
    ncs_data = readNCSfile(ncs_file, chains)
    return warnings, ncs_data, main_data, num_homologs

def readNCSfile(ncs_file, chains):
    ncs_lines = ""
    if os.path.exists(ncs_file) and os.path.getsize(ncs_file) > 0:
        with open(ncs_file, 'r') as f:
            ncs_lines = json.load(f)
    ncs_data = []
    if ncs_lines == None:
        for chain in chains:
            ncs_data.append([chain, ''])
        return ncs_data
    ncs_chains_dealt_with = []
    for row in ncs_lines:
        if row['chain'] in ncs_chains_dealt_with:
            for elem in ncs_data:
                if elem[0] == row['chain']:
                    elem[1] = elem[1] + row['ncschain']
            ncs_chains_dealt_with.append(row['ncschain'])
        else:
            ncs_data.append([row['chain'], row['ncschain']])
            ncs_chains_dealt_with.append(row['chain'])
            ncs_chains_dealt_with.append(row['ncschain'])
    for chain in chains:
        if not chain in ncs_chains_dealt_with:
            ncs_data.append([chain, ''])
    return ncs_data

def run_chain(chain, pdb_id):
    connection = mariadb.connect(user=app.config['DB_USERNAME'], password=app.config['DB_PASSWORD'], host=app.config['DB_IP'], database=app.config['DB_NAME'])
    cursor = connection.cursor()
    
    output_dict = { 
                    "SEQUENCE" : "",
                    "RAMA CLASS" : "",
                    "RAMA Z-SCORE" : "",
                    "RAMA Z-SCORE RELATIVE" : "",
                    "ROTA Z-SCORE" : "",
                    "ROTA Z-SCORE RELATIVE" : "",
                    "ROTA PCT" : "",
                    "ROTA PCT RELATIVE" : "",
                    "RSCC Z-SCORE" : "",
                    "RSCC Z-SCORE RELATIVE" : "",
                    "CIS-TRANS" : ["", ""],
                    "POST TRANS MOD" : ["", ""],
                    "HSSP SEQ PCT" : "",
                    "HSSP ENTROPY" : "",
                    "NUM SYM CONTACTS" : "",
                    "NUM H-BOND MAIN" : "",
                    "NUM H-BOND SIDE" : "",
                    "HAS ALTERNATES" : "",
                    "PDB SEQ PCT" : "",
                    "PDB PCT ORDERED" : "",
                    "NUM LIGAND CONTACTS" : [],
                    "REL SURFACE ACC" : "",
                    "SEC STRUC ELEM" : ["", ""],
                    "CA TORS OUTLIER" : "",
                    "Residue numbers" : [],
                    "ChainID" : chain
                }
    
    cursor.execute("SELECT r.seqidx, r.resnum, d.paramnum, d.datavalue "
                   "FROM Residue r "
                   "INNER JOIN ResData d ON r.resid = d.resid "
                   "WHERE r.pdbid = '" + pdb_id + "' AND r.chain = '" + chain + "' "
                   "ORDER BY r.seqidx ASC, d.paramnum ASC;")
    rows = cursor.fetchall()
    prev_row_seq_id = -1
    all_residue_data = []
    for row in rows:
        row_seq_id = row[0]
        if prev_row_seq_id == -1:
            prev_row_seq_id = row_seq_id
        if row_seq_id == prev_row_seq_id:
            all_residue_data.append(row)
        else:
            add_residue_to_output_data(all_residue_data, output_dict)
            all_residue_data.clear()
            prev_row_seq_id = row_seq_id
            all_residue_data.append(row)
    #add data of last residue
    add_residue_to_output_data(all_residue_data, output_dict)
    max_seq_idx = all_residue_data[0][0] #data is sorted by seqidx so last residue has the highest
    #add ligand binding information
    add_ligand_binding_info(cursor, int(max_seq_idx), output_dict, pdb_id, chain)
    connection.close()
    
    return output_dict

PARAMNUM_TO_PARAMNAME = {
            1 : "SEQUENCE",
            2 : "RAMA CLASS",
            3 : "RAMA Z-SCORE",
            4 : "RAMA Z-SCORE RELATIVE",
            5 : "ROTA Z-SCORE",
            6 : "ROTA Z-SCORE RELATIVE",
            7 : "ROTA PCT",
            8 : "ROTA PCT RELATIVE",
            10 : "RSCC Z-SCORE",
            11 : "RSCC Z-SCORE RELATIVE",
            12 : "CIS-TRANS",
            13 : "POST TRANS MOD",
            14 : "POST TRANS MOD",
            15 : "HSSP SEQ PCT",
            16 : "HSSP ENTROPY",
            17 : "NUM SYM CONTACTS",
            18 : "NUM H-BOND MAIN",
            19 : "NUM H-BOND SIDE",
            20 : "HAS ALTERNATES",
            21 : "PDB SEQ PCT",
            22 : "PDB PCT ORDERED",
            23 : "CIS-TRANS",
            30 : "REL SURFACE ACC",
            31 : "SEC STRUC ELEM",
            32 : "SEC STRUC ELEM",
            34 : "CA TORS OUTLIER"
        }

def getNameFromNum(paramnum):
    return PARAMNUM_TO_PARAMNAME.get(paramnum, "")

def add_residue_to_output_data(resdata, output_dict):
    param_nums_present = []
    rota_pct = -1
    addResidueNumber(resdata[0][1], output_dict)
    for datapoint in resdata:
        paramnum = datapoint[2]
        value = datapoint[3]
        param_nums_present.append(paramnum)
        if paramnum in (1, 2, 20, 34):
            add_simple_letter(getNameFromNum(paramnum), value, output_dict)
        elif paramnum in (3, 5):
            add_torsion_zscore_letter(getNameFromNum(paramnum), value, output_dict)
        elif paramnum == 10:
            add_zscore_letter(getNameFromNum(paramnum), value, output_dict)
        elif paramnum in (4, 6, 11):
            add_relative_zscore_letter(getNameFromNum(paramnum), value, output_dict)
        elif paramnum in (7, 15, 21, 22, 30):
            add_percentage_letter(getNameFromNum(paramnum), value, output_dict)
            if paramnum == 7:
                rota_pct = int(value)
        elif paramnum in (17, 18, 19):
            add_number_letter(getNameFromNum(paramnum), value, output_dict)
        elif paramnum == 8:
            add_rota_relative_pct_letter(getNameFromNum(paramnum), int(value), rota_pct, output_dict)
        elif paramnum == 16:
            add_hssp_entropy_letter(getNameFromNum(paramnum), float(value), output_dict)
        elif paramnum in (13, 31):
            add_simple_letter_to_first_field(getNameFromNum(paramnum), value, output_dict)
        elif paramnum == 12:
            add_simple_letter_to_second_field(getNameFromNum(paramnum), value, output_dict)
        elif paramnum in (14, 32):
            add_percentage_letter_to_second_field(getNameFromNum(paramnum), value, output_dict)
        elif paramnum == 23:
            add_cis_trans_letter(getNameFromNum(paramnum), float(value), output_dict)
    add_empty_data_letters(param_nums_present, output_dict)


def add_torsion_zscore_letter(paramname, value, output_dict):
    score = int ( (float(value) + 2) * 2 + 1)
    if score < 0:
        score = 0
    elif score > 9:
        score = 9
    output_dict[paramname] += str(score)

def add_zscore_letter(paramname, value, output_dict):
    score = int ( (float(value) + 10) / 2 + 1)
    if score < 0:
        score = 0
    elif score > 9:
        score = 9
    output_dict[paramname] += str(score)

def add_simple_letter(paramname, value, output_dict):
    output_dict[paramname] += value

def add_simple_letter_to_first_field(paramname, value, output_dict):
    output_dict[paramname][0] += value

def add_simple_letter_to_second_field(paramname, value, output_dict):
    output_dict[paramname][1] += value

def add_relative_zscore_letter(paramname, value, output_dict):
    score = int ( float(value) * 2 + 6 )
    if score < 0:
        score = 0
    elif score > 9:
        score = 9
    output_dict[paramname] += str(score)

def getPctScore(value):
    pct_score = int(value) // 10
    if pct_score > 9: #i.e. in case of 100%, set number to 9
        pct_score = 9
    return pct_score

def add_percentage_letter(paramname, value, output_dict):
    output_dict[paramname] += str(getPctScore(value))

def add_percentage_letter_to_second_field(paramname, value, output_dict):
    output_dict[paramname][1] += str(getPctScore(value))

def add_number_letter(paramname, value, output_dict):
    score = int(value)
    if score > 9:
        score = 9
    output_dict[paramname] += str(score)
    

def add_rota_relative_pct_letter(paramname, value, rota_pct, output_dict):
    if rota_pct == -1 or value == 1: #if no rota pct found or only 1 rotamer
        output_dict[paramname] += '-'
    else:
        score = int(rota_pct * value * 0.05)
        if score > 9:
            score = 9
        output_dict[paramname] += str(score)


def add_hssp_entropy_letter(paramname, value, output_dict):
    score = 9 - int(value * 4)
    if (score < 0):
        score = 0
    output_dict[paramname] += str(score)

def add_cis_trans_letter(paramname, omega, output_dict):
    dev_from_180 = min(abs(omega - 180), abs(omega + 180))
    if dev_from_180 < 30:
        output_dict[paramname][0] += 'T'
    elif dev_from_180 > 150:
        output_dict[paramname][0] += 'C'
    else:
        output_dict[paramname][0] += 'D'

def add_empty_data_letters(param_nums_present, output_dict):
    i = 1
    num_params = 34
    while i < num_params:
        i += 1
        if i in (9, 24, 25, 26, 27, 28, 29, 33) or i in param_nums_present:
            continue #these parameters are not collected or were already found
        elif i in (13, 23, 31):
            output_dict[getNameFromNum(i)][0] += '-'
        elif i in (12, 14, 32):
            output_dict[getNameFromNum(i)][1] += '-'
        else:
            output_dict[getNameFromNum(i)] += '-'

def addResidueNumber(resnum, output_dict):
    output_dict["Residue numbers"].append(resnum)

def add_ligand_binding_info(cursor, max_seq_idx, output_dict, pdbid, chain):
    cursor.execute("SELECT r.seqidx, l.restype, l.chain, l.resnum, l.inscode "
                   "FROM Residue r "
                   "INNER JOIN Contact c ON r.resid = c.resid "
                   "INNER JOIN Ligand l ON l.ligresid = c.ligresid "
                   "WHERE r.pdbid = '" + pdbid + "' AND r.chain = '" + chain + "' "
                   "ORDER BY r.seqidx ASC;")
    seq_ind_lig_bound = []
    contacts_text = []
    for row in cursor.fetchall():
        seq_idx = int(row[0])
        if seq_idx in seq_ind_lig_bound:
            idx_in_list = seq_ind_lig_bound.index(seq_idx)
            lig_text = row[1] + " " + str(row[2]) + " " + str(row[3])
            if row[4] != ".":
                lig_text += row[4]
            contacts_text[idx_in_list].append(lig_text)
        else:
            seq_ind_lig_bound.append(seq_idx)
            lig_text = row[1] + " " + str(row[2]) + " " + str(row[3])
            if row[4] != ".":
                lig_text += row[4]
            contacts_text.append([lig_text])
    next_contact_seq_idx = -1
    if len(seq_ind_lig_bound) > 0:
        next_contact_seq_idx = seq_ind_lig_bound.pop(0)
        next_contact = contacts_text.pop(0)
    idx = 0
    while idx <= max_seq_idx:
        if next_contact_seq_idx == idx:
            output_dict["NUM LIGAND CONTACTS"].append(next_contact)
            if len(seq_ind_lig_bound) > 0:
                next_contact_seq_idx = seq_ind_lig_bound.pop(0)
                next_contact = contacts_text.pop(0)
            else:
                next_contact_seq_idx = -1
        else:
            output_dict["NUM LIGAND CONTACTS"].append([])
        idx += 1
    #print(output_dict["NUM LIGAND CONTACTS"])

if __name__ == "__main__":
    warnings, ncs_data, output, num_homologs = query_database('1dio', True)
    print(ncs_data)
    print(output)
