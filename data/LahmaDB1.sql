-- MySQL dump 10.17  Distrib 10.3.25-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: LahmaDB1
-- ------------------------------------------------------
-- Server version	10.3.25-MariaDB-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Contact`
--

DROP TABLE IF EXISTS `Contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Contact` (
  `resid` bigint(20) unsigned NOT NULL,
  `ligresid` bigint(20) unsigned NOT NULL,
  UNIQUE KEY `UC_contact` (`resid`,`ligresid`),
  KEY `ligresid` (`ligresid`),
  CONSTRAINT `Contact_ibfk_1` FOREIGN KEY (`resid`) REFERENCES `Residue` (`resid`) ON DELETE CASCADE,
  CONSTRAINT `Contact_ibfk_2` FOREIGN KEY (`ligresid`) REFERENCES `Ligand` (`ligresid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Contact`
--

LOCK TABLES `Contact` WRITE;
/*!40000 ALTER TABLE `Contact` DISABLE KEYS */;
/*!40000 ALTER TABLE `Contact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Entry`
--

DROP TABLE IF EXISTS `Entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Entry` (
  `pdbid` char(4) NOT NULL,
  `resolution` float DEFAULT NULL,
  `spacegroup` varchar(10) DEFAULT NULL,
  `species` varchar(1000) DEFAULT NULL,
  `rfree` float DEFAULT NULL,
  PRIMARY KEY (`pdbid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Entry`
--

LOCK TABLES `Entry` WRITE;
/*!40000 ALTER TABLE `Entry` DISABLE KEYS */;
INSERT INTO `Entry` VALUES ('2ax4',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `Entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HomolMap`
--

DROP TABLE IF EXISTS `HomolMap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `HomolMap` (
  `pdbid` char(4) NOT NULL,
  `chain` char(1) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `homolpdbid` char(4) NOT NULL,
  `homolchain` char(1) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `querystartidx` smallint(5) unsigned DEFAULT NULL,
  `hitstartidx` smallint(5) unsigned DEFAULT NULL,
  `hitstopidx` smallint(5) unsigned DEFAULT NULL,
  `querygaps` text DEFAULT NULL,
  `hitgaps` text DEFAULT NULL,
  UNIQUE KEY `homolmapidx` (`pdbid`,`chain`,`homolpdbid`,`homolchain`),
  CONSTRAINT `HomolMap_ibfk_1` FOREIGN KEY (`pdbid`) REFERENCES `Entry` (`pdbid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HomolMap`
--

LOCK TABLES `HomolMap` WRITE;
/*!40000 ALTER TABLE `HomolMap` DISABLE KEYS */;
INSERT INTO `HomolMap` VALUES ('2ax4','A','1dio','A',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `HomolMap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ligand`
--

DROP TABLE IF EXISTS `Ligand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Ligand` (
  `ligresid` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pdbid` char(4) NOT NULL,
  `chain` char(1) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `restype` char(3) NOT NULL,
  `resnum` varchar(4) NOT NULL,
  `inscode` char(1) NOT NULL,
  PRIMARY KEY (`ligresid`),
  UNIQUE KEY `UC_ligand` (`pdbid`,`chain`,`resnum`,`inscode`),
  CONSTRAINT `Ligand_ibfk_1` FOREIGN KEY (`pdbid`) REFERENCES `Entry` (`pdbid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4580820 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ligand`
--

LOCK TABLES `Ligand` WRITE;
/*!40000 ALTER TABLE `Ligand` DISABLE KEYS */;
INSERT INTO `Ligand` VALUES (1,'2ax4','A','a','0','8');
/*!40000 ALTER TABLE `Ligand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NCSInfo`
--

DROP TABLE IF EXISTS `NCSInfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `NCSInfo` (
  `pdbid` char(4) NOT NULL,
  `chain` char(1) NOT NULL,
  `ncschain` char(1) NOT NULL,
  UNIQUE KEY `UC_ncs` (`pdbid`,`chain`,`ncschain`),
  CONSTRAINT `NCSInfo_ibfk_1` FOREIGN KEY (`pdbid`) REFERENCES `Entry` (`pdbid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NCSInfo`
--

LOCK TABLES `NCSInfo` WRITE;
/*!40000 ALTER TABLE `NCSInfo` DISABLE KEYS */;
INSERT INTO `NCSInfo` VALUES ('2ax4','A','B');
/*!40000 ALTER TABLE `NCSInfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Parameter`
--

DROP TABLE IF EXISTS `Parameter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Parameter` (
  `paramnum` tinyint(4) NOT NULL,
  `descr` varchar(50) NOT NULL,
  PRIMARY KEY (`paramnum`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Parameter`
--

LOCK TABLES `Parameter` WRITE;
/*!40000 ALTER TABLE `Parameter` DISABLE KEYS */;
INSERT INTO `Parameter` VALUES (1,'SEQ'),(2,'RAMAclass'),(3,'more'),(8,'Rottamer');
/*!40000 ALTER TABLE `Parameter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RedoChanges`
--

DROP TABLE IF EXISTS `RedoChanges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RedoChanges` (
  `resid` bigint(20) unsigned NOT NULL,
  `paramnum` tinyint(4) NOT NULL,
  UNIQUE KEY `UC_contact` (`resid`,`paramnum`),
  KEY `paramnum` (`paramnum`),
  CONSTRAINT `RedoChanges_ibfk_1` FOREIGN KEY (`resid`) REFERENCES `Residue` (`resid`) ON DELETE CASCADE,
  CONSTRAINT `RedoChanges_ibfk_2` FOREIGN KEY (`paramnum`) REFERENCES `Parameter` (`paramnum`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RedoChanges`
--

LOCK TABLES `RedoChanges` WRITE;
/*!40000 ALTER TABLE `RedoChanges` DISABLE KEYS */;
/*!40000 ALTER TABLE `RedoChanges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RedoParameter`
--

DROP TABLE IF EXISTS `RedoParameter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RedoParameter` (
  `paramnum` tinyint(4) NOT NULL,
  `descr` varchar(50) NOT NULL,
  PRIMARY KEY (`paramnum`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RedoParameter`
--

LOCK TABLES `RedoParameter` WRITE;
/*!40000 ALTER TABLE `RedoParameter` DISABLE KEYS */;
/*!40000 ALTER TABLE `RedoParameter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ResData`
--

DROP TABLE IF EXISTS `ResData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ResData` (
  `resid` bigint(20) unsigned NOT NULL,
  `paramnum` tinyint(4) NOT NULL,
  `datavalue` varchar(7) NOT NULL,
  UNIQUE KEY `UC_resdata` (`resid`,`paramnum`),
  KEY `paramnum` (`paramnum`),
  CONSTRAINT `ResData_ibfk_1` FOREIGN KEY (`resid`) REFERENCES `Residue` (`resid`) ON DELETE CASCADE,
  CONSTRAINT `ResData_ibfk_2` FOREIGN KEY (`paramnum`) REFERENCES `Parameter` (`paramnum`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ResData`
--

LOCK TABLES `ResData` WRITE;
/*!40000 ALTER TABLE `ResData` DISABLE KEYS */;
INSERT INTO `ResData` VALUES (1,1,'Q'),(1,2,'-'),(530307031,1,'G'),(530307031,2,'4'),(530307032,1,'A'),(530307033,1,'T'),(530307034,1,'C'),(530307036,1,'I'),(530307037,1,'P'),(530307038,1,'Y'),(530307039,1,'Y'),(530307040,1,'U'),(530307040,3,'2'),(530307041,1,'M'),(530307041,3,'1');
/*!40000 ALTER TABLE `ResData` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Residue`
--

DROP TABLE IF EXISTS `Residue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Residue` (
  `resid` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pdbid` char(4) NOT NULL,
  `chain` char(1) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `seqidx` smallint(5) unsigned NOT NULL,
  `isordered` tinyint(1) DEFAULT NULL,
  `restype` char(3) DEFAULT NULL,
  `resnum` varchar(4) DEFAULT NULL,
  `inscode` char(1) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`resid`),
  UNIQUE KEY `UC_residue` (`pdbid`,`chain`,`seqidx`),
  CONSTRAINT `Residue_ibfk_1` FOREIGN KEY (`pdbid`) REFERENCES `Entry` (`pdbid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=530307042 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Residue`
--

LOCK TABLES `Residue` WRITE;
/*!40000 ALTER TABLE `Residue` DISABLE KEYS */;
INSERT INTO `Residue` VALUES (1,'2ax4','A',1,NULL,NULL,'1','8'),(530307031,'2ax4','A',2,NULL,NULL,'2',NULL),(530307032,'2ax4','A',3,NULL,NULL,'3',NULL),(530307033,'2ax4','A',4,NULL,NULL,'4',NULL),(530307034,'2ax4','A',5,NULL,NULL,'5',NULL),(530307035,'2ax4','A',6,NULL,NULL,'6',NULL),(530307036,'2ax4','A',7,NULL,NULL,'7',NULL),(530307037,'2ax4','A',8,NULL,NULL,'8',NULL),(530307038,'2ax4','A',9,NULL,NULL,'9',NULL),(530307039,'2ax4','A',10,NULL,NULL,'10',NULL),(530307040,'2ax4','A',11,NULL,NULL,'11',NULL),(530307041,'2ax4','A',12,NULL,NULL,'12',NULL);
/*!40000 ALTER TABLE `Residue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Warning`
--

DROP TABLE IF EXISTS `Warning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Warning` (
  `pdbid` char(4) NOT NULL,
  `message` varchar(400) NOT NULL,
  UNIQUE KEY `UC_contact` (`pdbid`,`message`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Warning`
--

LOCK TABLES `Warning` WRITE;
/*!40000 ALTER TABLE `Warning` DISABLE KEYS */;
/*!40000 ALTER TABLE `Warning` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-04-28 12:25:08
