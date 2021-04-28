// clear time!
'use strict';

function clear_pdb_search() {
    $('#pdb-id-search-alerts').html('');
    $('.pdb-search-progress-bar').css('display', 'none');
    
    if (LAHMA.dbsearch_ajax) {
        LAHMA.dbsearch_ajax.abort();
    }
}


function clear_all() {
    clear_pdb_search();
    
    for (var i = 0; i < LAHMA.chains.length; i += 1) {
        var element = document.getElementById('chain' + LAHMA.chains[i]);
        
        $('#sequences-labels' + LAHMA.chains[i]).html('');
        $('#sequences-viewer' + LAHMA.chains[i]).html('');
        $('#aa-label' + LAHMA.chains[i]).html('');
        $('#aa-viewer' + LAHMA.chains[i]).html('');
        element.parentNode.removeChild(element);
    }
    // ClEAR BY SECTION???
    
}


// hide time
function hide_byclass(classname) {
    $('.' + classname).each(function () {
        $(this).css('display', 'none');
    });
}


// show time!
function show_byclass(classname) {
    $('.' + classname).each(function () {
        $(this).css('display', 'block');
    });
}


function initialize_reset() {
    LAHMA.starts = [];
    LAHMA.stops = [];
    $('#ortho-one2one')[0].checked = true;
    $('#ortho-one2many')[0].checked = true;
    $('#ortho-many2many')[0].checked = false;
    $('#paralog-species')[0].checked = false;
    $('#model-organisms')[0].checked = true;
    
    $('#ortho-one2one').parent().contents().filter(function () {
        return this.nodeType === 3; 
    }).remove();
    $('#ortho-one2one').parent().append(' 1 to 1 orthologs');
    $('#ortho-one2many').parent().contents().filter(function () {
        return this.nodeType === 3; 
    }).remove();
    $('#ortho-one2many').parent().append(' 1 to many orthologs');
    $('#ortho-many2many').parent().contents().filter(function () {
        return this.nodeType === 3; 
    }).remove();
    $('#ortho-many2many').parent().append(' many to many orthologs');
    $('#model-organisms').parent().contents().filter(function () {
        return this.nodeType === 3; 
    }).remove();
    $('#model-organisms').parent().append(' model organisms only');
    // paralogs to be removed
}


function validate_search_database_id(pdb_id) {
    if (pdb_id === null || pdb_id === '') {
        $('#pdb-id-search-alerts').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">×</a>'
                + '<span>No ID to search for. Please provide an ID.</span></div>');
        return false;
    }
    if (pdb_id.search(/^[a-z0-9]+$/gi) === -1) {
        $('#pdb-id-search-alerts').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">×</a>'
                + '<span>The given ID is not valid.</span></div>');
        return false;
    }
}

function getResidueNumbers(pdb_residue_numbers, chain_id, sequence){
    var curr_length = 0;
    var indexes_string = '';
    for (var i = 0; i < pdb_residue_numbers.length; i += 1) {
        if (pdb_residue_numbers[i - 1] == null && pdb_residue_numbers[i] != null) {
            var base = pdb_residue_numbers[i];
            for (var j = i - 1; j >= 0; j -= 1) {
                base -= 1;
                pdb_residue_numbers[j] = base;
            }
            continue;
        }
        if (pdb_residue_numbers[i] != null && pdb_residue_numbers[i + 1] == null) {
            var base = Number(pdb_residue_numbers[i]);
            var end = pdb_residue_numbers.length;
            for (j = i + 1; j <= end; j += 1) {
                base += 1;
                pdb_residue_numbers[j] = base;
            }
            break; // otherwise we have an infinite loop here
        }
    }
    // here we add the indexes as a string
    while (curr_length < pdb_residue_numbers.length - 1) {
        if (curr_length % 10 === 9) {
            indexes_string += getStartTableElement('', curr_length, chain_id, pdb_residue_numbers, sequence) + '|' + getEndTableElement();
            var resnum = String(pdb_residue_numbers[curr_length]);
            for (var i = 0; i < resnum.length; i++){
                indexes_string += getStartTableElement('', curr_length + i + 1, chain_id, pdb_residue_numbers, sequence) + resnum.charAt(i) + getEndTableElement();
            }
            curr_length += resnum.length + 1; //1 is for the '|'
        } else {
            indexes_string += getStartEmptyTableElement(curr_length, chain_id, pdb_residue_numbers, sequence) + ' ' + getEndTableElement();
            curr_length += 1;
        }
    }
    return indexes_string + '<br>';
}

function add_explanation(explanation) {
    return ' <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Question-mark-grey.jpg" ' +
        //https://upload.wikimedia.org/wikipedia/commons/1/11/Blue_question_mark_icon.svg" ' +
           'alt="HTML5 Icon" style="width:16px;height:16px;" data-toggle="tooltip" title="' + explanation + '">';
}

var alpha_letter = '\u03B1';

function get_explanations() {
    var angstrom_letter = '\u212B';
    var line_break = '&#013;'
    return [ "", "", "",
        add_explanation("Ramachandran Z-score." + line_break + "Average is 5, higher is better."),
        add_explanation("Ramachandran Z-score compared to the same Z-score of homologs." +  line_break +
                        "Average is 5, higher is better."),
        add_explanation("Classification of Ramachandran angles." + line_break + "O: outlier" + line_break +
                        "o: minor outlier" + line_break + "M: minority class"),
        add_explanation("Classification of the torsion angle between four consecutive C" + alpha_letter +"s as a " +
                        "measure of local backbone conformation." + line_break + "O: outlier" + line_break +
                        "o: minor outlier" + line_break + "M: minority class"),
        add_explanation("Cis-transness of the peptides." + line_break + "T: trans" + line_break + "C: cis" +
                        line_break + "D: distorted" + line_break + "Colors indicate conformational variability and" +
                        " cis/distorted angles are also colored."),
        add_explanation("Secondary structure as given by DSSP." + line_break + "H: helix" + line_break + 
                        "E: strand" + line_break + "T: hydrogen bonded turn" + line_break + "B: beta bridge" + 
                        line_break + "S: bend" + line_break + "G: 3-10 helix" + line_break + "I: pi-helix" + 
                        line_break + "-: undefined" + line_break + "Colors indicate that the homologs" +
                        " are often found in different secondary structure elements."),
        add_explanation("Number of main-chain H-bonds to protein."),
        "",
        add_explanation("Rotamer Z-score." + line_break + "Average is 5, higher is better."),
        add_explanation("Rotamer Z-score compared to the same Z-score of homologs." + line_break +
                        "Average is 5, higher is better."),
        add_explanation("Percentage of side-chains found in the same rotamer." + line_break + "9: 90-100%" +
                        line_break + "8: 80-89%" + line_break + "etc."),
        add_explanation("How often current rotamer occurs relative to the number of different rotamers in homologs." +
                        line_break + "9: this rotamer occurs relatively often" + line_break +
                        "0: this rotamer is very rare"),
        add_explanation("The occurrence of post-translational modifications (PTMs)." + line_break + "Uppercase: the" +
                        " query contains the PTM." + line_break + "Lowercase: homologs contain the PTM but the " +
                        "query does not." + line_break + "Color intensity increases as more homologs contain the " +
                        "PTM." + line_break + "For an overview of PTMs, see Help."),
        add_explanation("Number of side-chain H-bonds to protein"),
        "",
        add_explanation("Real-space correlation coefficient Z-score." + line_break +
                        "Average is 5, higher is better."),
        add_explanation("Real-space correlation coefficient Z-score compared to the same Z-score of homologs." +
                        line_break + "Average is 5, higher is better."),
        add_explanation("Number of ligand contacts per residue." + line_break + "Contacts up to 3.5 " +
                        angstrom_letter + " are counted."),
        add_explanation("The conservation of residues in the multiple sequence alignment of HSSP." + line_break +
                        "9: 90-100%" + line_break + "8: 80-89%" + line_break + "etc."),
        add_explanation("The variability per residue position in a multiple sequence alignment." + line_break +
                        "9: highly conserved" + line_break +"0: highly variable"),
        add_explanation("The conservation of homologous residues in the PDB." + line_break + "9: 90-100%" +
                        line_break + "8: 80-89%" + line_break + "etc."),
        add_explanation("The percentage of homologous residues in the PDB that is ordered." + line_break +
                        "9: 90-100%" + line_break + "0: 0-9%" + line_break + "etc." + line_break + "Note that a 0 " +
                        "indicates the residue is modeled in at least one homolog! Residues that are never ordered" +
                        " are indicated with '-'."),
        add_explanation("The number of symmetry contacts." + line_break + "Contacts up to 3.5 " + angstrom_letter +
                        " are counted."),
        add_explanation("Whether or not residues have alternates." + line_break + "Y: yes" + line_break +
                        "S: only side-chain"),
        add_explanation("The relative surface accessibility as percentage of the maximum." + line_break + "0: 0-9%" +
                        line_break + "1: 10-19%" + line_break + "etc.")
    ];
}

function get_labels() {
    return [ "<font color=\"red\">Sequence</font>", "", "<b>Backbone</b>", "Rama score", "Homol Rama score",
            "Rama class", "C" + alpha_letter + " torsion", "Cis-trans", "Sec struc", "No. H-bond main", 
            "<b>Sidechain</b>", "Rottamer score", "Homol rota score", "Rotamer %", "Homol rota %", "Post-trans mod",
            "No. H-bond side", "<b>Other</b>", "Density fit", "Homol density fit", "No. ligand contacts",
            "Mult seq align %", "Mult seq entropy", "Conserved PDB %", "Ordered %", "No. symm contacts",
            "Alternate conf", "Surface access" ];
}

var to_three_letter_code_dict = { "A" : "Ala", "C" : "Cys", "D" : "Asp", "E" : "Glu", "F" : "Phe", "G" : "Gly",
                                  "H" : "His", "I" : "Ile", "K" : "Lys", "L" : "Leu", "M" : "Met", "N" : "Asn",
                                  "P" : "Pro", "Q" : "Gln", "R" : "Arg", "S" : "Ser", "T" : "Thr", "V" : "Val",
                                  "W" : "Trp", "Y" : "Tyr" };

function getResNumberMouseover(res_number, one_letter_code, is_past_last){
    if (is_past_last)
        return "";
    var res_type = one_letter_code;
    if (one_letter_code == one_letter_code.toUpperCase()){
        if (one_letter_code in to_three_letter_code_dict)
            res_type = to_three_letter_code_dict[one_letter_code];
        return res_type + " " + res_number;
    } else {
        if (one_letter_code.toUpperCase() in to_three_letter_code_dict)
            res_type = to_three_letter_code_dict[one_letter_code.toUpperCase()];
        return res_type + " (disordered)";
    }
}

function getStartEmptyTableElement(i, chain_id, res_numbers, sequence){
    return '<td ' + 
                'onmouseenter="onMouseOverAA(event)" data-toggle="tooltip" title="' + 
                    getResNumberMouseover(res_numbers[i], sequence[i], i >= sequence.length) + '" name="' + i + 
                    '" id= "' + chain_id + '"' + 
                'onmouseout="onMouseOutAA(event)" name="' + i + '" id= "' + chain_id + '"' + 
            '><span class="amino-acid"' +
                'onclick="onclickAA(event)" name="' + i + '" id= "' + chain_id + '"' + 
                'style="cursor:pointer; white-space:pre;"' +
            '>';
}
function getStartTableElement(color, i, chain_id, res_numbers, sequence){
    return '<td ' + 
                'onmouseenter="onMouseOverAA(event)" data-toggle="tooltip" title="' + 
                    getResNumberMouseover(res_numbers[i], sequence[i], i >= sequence.length) + '" name="' + i +
                    '" id= "' + chain_id + '"' + 
                'onmouseout="onMouseOutAA(event)" name="' + i + '" id= "' + chain_id + '"' + 
            '><span class="amino-acid"' +
                'onclick="onclickAA(event)" name="' + i + '" id= "' + chain_id + '"' + 
                'style="cursor:pointer; background-color:' + color + ';" ' + 
            '>';
}
function getStartLigandTableElement(color, i, chain_id, res_numbers, sequence, liginfo){
    var title = getResNumberMouseover(res_numbers[i], sequence[i], i >= sequence.length) + '. Ligand';
    if (liginfo.length > 1) title += 's';
    title += ': ';
    for (let i = 0; i < liginfo.length; i++){
        if (i > 0) title += ", ";
        title += liginfo[i];
    }
    return '<td ' + 
                'onmouseenter="onMouseOverAA(event)" data-toggle="tooltip" title="' + 
                    title + '" name="' + i +
                    '" id= "' + chain_id + '"' + 
                'onmouseout="onMouseOutAA(event)" name="' + i + '" id= "' + chain_id + '"' + 
            '><span class="amino-acid"' +
                'onclick="onclickAA(event)" name="' + i + '" id= "' + chain_id + '"' + 
                'style="cursor:pointer; background-color:' + color + ';" ' + 
            '>';
}
function getEndTableElement(){
    return '</span></td>';
}

function getLigandNumText(annotation, chain_id, resnums, seq){
    var annotation_span = "";
    for (let j = 0; j < annotation.length; j += 1) {
        var color = "";
        var annotation_letter = "-"
        if (annotation[j] && annotation[j].length > 0){ 
            color = 'rgb(255, 255, 150)';
            annotation_letter = String(annotation[j].length);
            annotation_span += getStartLigandTableElement(color, j, chain_id, resnums, seq, annotation[j]) + 
                                    annotation_letter + getEndTableElement();
        } else {
            annotation_span += getStartTableElement(color, j, chain_id, resnums, seq) + annotation_letter + getEndTableElement();
        }
    }
    return annotation_span;
}

function areAllHyphen(annotation){
    for (let j = 0; j < annotation.length; j += 1) {
        if (annotation[j] != '-')
            return false;
    }
    return true;
}
function areAllEmpty(annotation){
    for (let j = 0; j < annotation.length; j += 1) {
        if (annotation[j].length != 0)
            return false;
    }
    return true;
}

function draw_annotations(labels_id, viewer_id, explains_id, display_object, chain_id) {
    var i, j;
    var annotation_spans = [];
    var empty_row_indices = [];
    var labels = get_labels();
    var explanations = get_explanations();
    var length = 0;
    var resnums, seq;
    for(var label in display_object){
        if (label == 'Residue numbers'){
            resnums = display_object[label];
        } else if (label == 'SEQUENCE'){
            seq = display_object[label];
        }
    }
    for(var label in display_object){
        if ('ChainID' == label)
            continue;
        var annotation = display_object[label];
        var annotation_span = '';
        switch (label) {
            case 'SEQUENCE':
                for (i = 0; i < annotation.length; i += 1) {
                    annotation_span += getStartTableElement('', i, chain_id, resnums, seq) + annotation[i] + getEndTableElement();
                }
                annotation_spans[0] = '<tr>' + annotation_span + '</tr>';
                length = annotation.length;
                break;
            case 'Residue numbers':
                annotation_spans[1] = getResidueNumbers(annotation, chain_id, seq);
                break;
            case 'RAMA CLASS':
            case 'CA TORS OUTLIER':
                for (j = 0; j < annotation.length; j += 1) {
                    var color = '';
                    if (annotation[j] === 'O') {      color = 'rgb(255, 80, 80)';}
                    else if (annotation[j] === 'o') { color = 'rgb(255, 128, 0)';}
                    else if (annotation[j] === 'M') { color = 'rgb(255, 255, 120)';}
                    annotation_span += getStartTableElement(color, j, chain_id, resnums, seq) + annotation[j] + getEndTableElement();
                }
                if (label == "RAMA CLASS"){
                    annotation_spans[5] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(5);
                } else {
                    annotation_spans[6] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(6);
                }
                break;
            case 'CIS-TRANS':
                var annotation2color = annotation[1];
                annotation = annotation[0];
                for (j = 0; j < annotation.length; j += 1) {
                    var color = '';
                    if (annotation2color[j] === 'O') {      color = 'rgb(255, 120, 120)';}
                    else if (annotation2color[j] === 'M') { color = 'rgb(255, 255, 150)';}
                    else if (annotation[j] === 'C') {       color = 'rgb(255, 200, 120)';}
                    else if (annotation2color[j] === 'V') { color = 'rgb(255, 255, 170)';}
                    else if (annotation[j] === 'D') {       color = 'rgb(255, 200, 150)';}
                    annotation_span += getStartTableElement(color, j, chain_id, resnums, seq) + annotation[j] + getEndTableElement();
                }
                annotation_spans[7] = '<tr>' + annotation_span + '</tr>';
                if (areAllHyphen(annotation))
                    empty_row_indices.push(7);
                break;
            case 'POST TRANS MOD':
                var annotation2color = annotation[1];
                annotation = annotation[0];
                for (j = 0; j < annotation.length; j += 1) {
                    var color = '';
                    if (annotation2color[j] === '0') { color = 'rgb(255, 200, 200)';}
                    else if (annotation2color[j] === '1') { color = 'rgb(255, 190, 190)';}
                    else if (annotation2color[j] === '2') { color = 'rgb(255, 180, 180)';}
                    else if (annotation2color[j] === '3') { color = 'rgb(255, 170, 170)';}
                    else if (annotation2color[j] === '4') { color = 'rgb(255, 160, 160)';}
                    else if (annotation2color[j] === '5') { color = 'rgb(255, 150, 150)';}
                    else if (annotation2color[j] === '6') { color = 'rgb(255, 140, 140)';}
                    else if (annotation2color[j] === '7') { color = 'rgb(255, 130, 130)';}
                    else if (annotation2color[j] === '8') { color = 'rgb(255, 120, 120)';}
                    else if (annotation2color[j] === '9') { color = 'rgb(255, 110, 110)';}
                    annotation_span += getStartTableElement(color, j, chain_id, resnums, seq) + annotation[j] + getEndTableElement();
                }
                annotation_spans[15] = '<tr>' + annotation_span + '</tr>';
                if (areAllHyphen(annotation))
                    empty_row_indices.push(15);
                break;
            case 'SEC STRUC ELEM':
                var annotation2color = annotation[1];
                annotation = annotation[0];
                for (j = 0; j < annotation.length; j += 1) {
                    var color = '';
                    if (annotation2color[j] === '0') {      color = 'rgb(255, 135, 135)';}
                    else if (annotation2color[j] === '1') { color = 'rgb(255, 165, 165)';}
                    else if (annotation2color[j] === '2') { color = 'rgb(255, 195, 195)';}
                    else if (annotation2color[j] === '3') { color = 'rgb(255, 225, 225)';}
                    annotation_span += getStartTableElement(color, j, chain_id, resnums, seq) + annotation[j] + getEndTableElement();
                }
                annotation_spans[8] = '<tr>' + annotation_span + '</tr>';
                if (areAllHyphen(annotation))
                    empty_row_indices.push(8);
                break;
            case 'PDB SEQ PCT':
            case 'PDB PCT ORDERED':
                for (j = 0; j < annotation.length; j += 1) {
                    var color = '';
                    if (annotation[j] === '0') {     color = 'rgb(255, 135, 135)';}
                    else if (annotation[j] === '1') {color = 'rgb(255, 145, 145)';}
                    else if (annotation[j] === '2') {color = 'rgb(255, 155, 155)';}
                    else if (annotation[j] === '3') {color = 'rgb(255, 165, 165)';}
                    else if (annotation[j] === '4') {color = 'rgb(255, 175, 175)';}
                    else if (annotation[j] === '5') {color = 'rgb(255, 185, 185)';}
                    else if (annotation[j] === '6') {color = 'rgb(255, 195, 195)';}
                    else if (annotation[j] === '7') {color = 'rgb(255, 205, 205)';}
                    else if (annotation[j] === '8') {color = 'rgb(255, 215, 215)';}
                    annotation_span += getStartTableElement(color, j, chain_id, resnums, seq) + annotation[j] + getEndTableElement();
                }
                if (label == "PDB SEQ PCT"){
                    annotation_spans[23] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(23);
                } else {
                    annotation_spans[24] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(24);
                }
                break;
            case 'NUM LIGAND CONTACTS':
                annotation_spans[20] = '<tr>' + getLigandNumText(annotation, chain_id, resnums, seq) + '</tr>'; 
                if (areAllEmpty(annotation))
                    empty_row_indices.push(20);
                break;
            case 'HAS ALTERNATES':
                for (j = 0; j < annotation.length; j += 1) {
                    var color = '';
                    if (annotation[j] === 'Y') {     color = 'rgb(255, 200, 100)';}
                    else if (annotation[j] === 'S') {color = 'rgb(255, 255, 150)';}
                    annotation_span += getStartTableElement(color, j, chain_id, resnums, seq) + annotation[j] + getEndTableElement();
                }
                annotation_spans[26] = '<tr>' + annotation_span + '</tr>';
                if (areAllHyphen(annotation))
                    empty_row_indices.push(26);
                break;
            case 'RAMA Z-SCORE':
            case 'RAMA Z-SCORE RELATIVE':
            case 'ROTA Z-SCORE':
            case 'ROTA Z-SCORE RELATIVE':
            case 'RSCC Z-SCORE':
            case 'RSCC Z-SCORE RELATIVE':
            case 'HSSP SEQ PCT':
            case 'HSSP ENTROPY':
                for (j = 0; j < annotation.length; j += 1) {
                    var color = '';
                    if (annotation[j] === '0') {      color = 'rgb(255, 142, 142)';}
                    else if (annotation[j] === '1') { color = 'rgb(255, 167, 167)';}
                    else if (annotation[j] === '2') { color = 'rgb(255, 192, 192)';}
                    else if (annotation[j] === '3') { color = 'rgb(255, 217, 217)';}
                    else if (annotation[j] === '4') { color = 'rgb(255, 242, 242)';}
                    else if (annotation[j] === '5') { color = 'rgb(242, 242, 255)';}
                    else if (annotation[j] === '6') { color = 'rgb(217, 217, 255)';}
                    else if (annotation[j] === '7') { color = 'rgb(192, 192, 255)';}
                    else if (annotation[j] === '8') { color = 'rgb(167, 167, 255)';}
                    else if (annotation[j] === '9') { color = 'rgb(142, 142, 255)';}
                    annotation_span += getStartTableElement(color, j, chain_id, resnums, seq) + annotation[j] + getEndTableElement();
                }
                if (label == "RAMA Z-SCORE"){
                    annotation_spans[3] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(3);
                } else if (label == "RAMA Z-SCORE RELATIVE"){
                    annotation_spans[4] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(4);
                } else if (label == "ROTA Z-SCORE"){
                    annotation_spans[11] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(11);
                } else if (label == "ROTA Z-SCORE RELATIVE"){
                    annotation_spans[12] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(12);
                } else if (label == "RSCC Z-SCORE"){
                    annotation_spans[18] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(18);
                } else if (label == "RSCC Z-SCORE RELATIVE"){
                    annotation_spans[19] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(19);
                } else if (label == "HSSP SEQ PCT"){
                    annotation_spans[21] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(21);
                } else {
                    annotation_spans[22] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(22);
                }
                break;
            case 'ROTA PCT':
            case 'ROTA PCT RELATIVE':
                for (j = 0; j < annotation.length; j += 1) {
                    var color = '';
                    if (annotation[j] === '0') {      color = 'rgb(255, 155, 155)';}
                    else if (annotation[j] === '1') { color = 'rgb(255, 175, 175)';}
                    else if (annotation[j] === '2') { color = 'rgb(255, 195, 195)';}
                    else if (annotation[j] === '3') { color = 'rgb(255, 215, 215)';}
                    else if (annotation[j] === '4') { color = 'rgb(255, 235, 235)';}
                    else if (annotation[j] === '6') { color = 'rgb(235, 235, 255)';}
                    else if (annotation[j] === '7') { color = 'rgb(215, 215, 255)';}
                    else if (annotation[j] === '8') { color = 'rgb(195, 195, 255)';}
                    else if (annotation[j] === '9') { color = 'rgb(175, 175, 255)';}
                    annotation_span += getStartTableElement(color, j, chain_id, resnums, seq) + annotation[j] + getEndTableElement();
                }
                if (label == "ROTA PCT"){
                    annotation_spans[13] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(13);
                } else {
                    annotation_spans[14] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(14);
                }
                break;
            case 'NUM H-BOND MAIN':
            case 'NUM H-BOND SIDE':
            case 'NUM SYM CONTACTS':
            case 'REL SURFACE ACC':
                var color = '';
                for (j = 0; j < annotation.length; j += 1) {
                    annotation_span += getStartTableElement(color, j, chain_id, resnums, seq) + annotation[j] + getEndTableElement();
                }
                if (label == "NUM H-BOND MAIN"){
                    annotation_spans[9] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(9);
                } else if (label == "NUM SYM CONTACTS"){
                    annotation_spans[25] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(25);
                } else if (label == "REL SURFACE ACC"){
                    annotation_spans[27] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(27);
                } else {
                    annotation_spans[16] = '<tr>' + annotation_span + '</tr>';
                    if (areAllHyphen(annotation))
                        empty_row_indices.push(16);
                }
                break;
        }
    }
    //fill empty lines with empty elements for mouseovers to work properly
    var empty_span = '';
    for (j = 0; j < length; j += 1) {
        empty_span += getStartEmptyTableElement(j, chain_id, resnums, seq) + ' ' + getEndTableElement();
    }
    annotation_spans[2]='<tr>' + empty_span + '</tr>';
    annotation_spans[10]='<tr>' + empty_span + '</tr>'; 
    annotation_spans[17]='<tr>' + empty_span + '</tr>';

    //remove rows with only hyphens
    var all_labels = labels;
    empty_row_indices.sort(function(a, b) { return b - a }); //sort high to low
    empty_row_indices.forEach(function(idx) {
        annotation_spans.splice(idx, 1);
        labels.splice(idx, 1);
        explanations.splice(idx, 1);
    });

    //put the output into html variables
    var total_annotation = '';
    annotation_spans.forEach(function(ann){
        total_annotation += ann;
    });
    var label_text = "";
    var explain_text = "";
    for (let k = 0; k < labels.length; k += 1){
        label_text += labels[k] + "<br>";
        explain_text += explanations[k] + "<br>";
    }
/*    TODO it may be nice to show which rows have been hidden but that requires an extra field outside the table, the
 *    test version shown below here doesn't work
 *
     if (empty_row_indices.length > 0){
        total_annotation += "<tr>*** The following rows were not shown: ";
        for (let k = 0; k < empty_row_indices.length; k++){
            total_annotation += all_labels[k];
            if (k + 1 < empty_row_indices.length) total_annotation += ", ";
        }
        total_annotation += "***</tr><tr>*** These rows were either not computed or there was nothing to be shown (e.g. no Rama outliers or PTMs)</tr>";
    }
    console.log(total_annotation);
 */

    $(labels_id).html(label_text);
    $(explains_id).html(explain_text);
    $(viewer_id).html(total_annotation);
}


function update_status(task_uuid) {
    // send GET request to status URL
    
    $.ajax({
        type: 'GET',
        url: window.location.origin + '/pdbscript_status_file',
        data: {
            task_uuid: task_uuid
        },
        async: true,
        success: function (response) {
            response = $.parseJSON(response);
            //if success finifh
            //else , upadate text,and recall
            if (response.error) {
                document.getElementById('currentData').innerHTML = response.error;
                return;
            }
            var text = response.text;
            var lines = text.split(/\r?\n/);
            document.getElementById('currentData').innerHTML = text.replace(/\n/g, '<br>');
            lines.pop();
            var last_line = lines.pop();
            if (last_line === 'All processes finished!') {
                window.location.href = window.location.origin + '/pdbscript_results?task_uuid=' + task_uuid;
            }
            else {
                // rerun in 2 seconds
                setTimeout(function() {
                    update_status(task_uuid);
                }, 2000);
            }
        },
        error: function () {
            alert('crap!');
        }
    });
}


function show_results(display_objects, ncs, warnings, num_homologs){
    var last_element = document.getElementById('first-div');
    var i, j;
    
    for (i = 0; i < display_objects.length; i += 1) {
        var display_object = display_objects[i];
        var chain_id = display_object["ChainID"];
        //LAHMA.chains += chain_id;
        var inorout = '';
        var rest_header_text = ' (' + num_homologs[i] + ' homologous chains';
        for (j = 0; j < ncs.length; j += 1) {
            if (chain_id == ncs[j][0]) {
                inorout = 'in';
                break;
            } else if (ncs[j][1].indexOf(chain_id) > -1){
                rest_header_text += ", NCS copy of chain " + ncs[j][0];
                break;
            }
        }
        rest_header_text += ')';

        var card = 
    `
    <!--Card-->
    <div class="card section1 panel-group panel" id='chain` + chain_id + `'>
    <!--Title-->
    <div class="panel-heading">
    <h4 class="panel-title">
    <a data-toggle="collapse" data-parent="#" href="#predictions-panel` + chain_id + `">
        <span class="black-font">Chain ` + chain_id + rest_header_text + ` </span>
    </a>
    </h4>
    </div>
    <!--Card content-->
    <div class="card-block panel-collapse collapse ` + inorout + `" id="predictions-panel` + chain_id + `">
    <!--Text-->
    <table class="pred-panel">
    <tr>
        <td style="width: 170px; vertical-align: top;"><div class="pred-labels" id="sequences-labels` + chain_id + `" data-placement="right"></div></td>
        <td style="width: 25px; vertical-align: top;"><div class="pred-explain" id="sequences-explain` + chain_id + `" data-placement="right"></div></td>
    <!--
        <td style="vertical-align: top;"><div class="pred-viewer" id="sequences-viewer` + chain_id + `" onscroll="$('#aa-viewer` + chain_id + `').scrollLeft($(this).scrollLeft());"></div></td>
    -->
        <td style="vertical-align: top;">
          <div class="pred-viewer">
            <table id="sequences-viewer` + chain_id + `">
            </table>
          </div>
        </td>
    </tr>
    </table>
    </div>
    <!--/.Card content-->
    </div>
    <!--/.Card-->
    `

        last_element.outerHTML += card;
        
        last_element = document.getElementById('chain' + chain_id);

        $('#aa-viewer' + chain_id).css('overflow', 'hidden'); // to hide the scroll bar
//        // scroll synchronization of aa-viewer, their bars will be hidden on success
//        $('#sequences-viewer' + chain_id).on('scroll', function () {
//            $('#aa-viewer' + chain_id).scrollLeft($(this).scrollLeft());
//        });                

        draw_annotations('#sequences-labels' + chain_id, '#sequences-viewer' + chain_id, 
                         '#sequences-explain' + chain_id, display_object, chain_id);
    }
    $('.collapse.in').prev('.panel-heading').addClass('active');
    $('#bs-collapse')
    .on('show.bs.collapse', function (a) {
        $(a.target).prev('.panel-heading').addClass('active');
    })
    .on('hide.bs.collapse', function (a) {
        $(a.target).prev('.panel-heading').removeClass('active');
    });

    
}
