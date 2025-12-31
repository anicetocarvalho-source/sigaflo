-- Inserir todos os municípios de Angola

-- BENGO (BGO) - 6 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'BGO'), 'Ambriz', 'AMB'),
((SELECT id FROM provinces WHERE code = 'BGO'), 'Bula Atumba', 'BUA'),
((SELECT id FROM provinces WHERE code = 'BGO'), 'Dande', 'DAN'),
((SELECT id FROM provinces WHERE code = 'BGO'), 'Dembos', 'DEM'),
((SELECT id FROM provinces WHERE code = 'BGO'), 'Nambuangongo', 'NAM'),
((SELECT id FROM provinces WHERE code = 'BGO'), 'Pango Aluquém', 'PAL');

-- BENGUELA (BGU) - 10 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'BGU'), 'Balombo', 'BAL'),
((SELECT id FROM provinces WHERE code = 'BGU'), 'Baía Farta', 'BFA'),
((SELECT id FROM provinces WHERE code = 'BGU'), 'Benguela', 'BEN'),
((SELECT id FROM provinces WHERE code = 'BGU'), 'Bocoio', 'BOC'),
((SELECT id FROM provinces WHERE code = 'BGU'), 'Caimbambo', 'CAI'),
((SELECT id FROM provinces WHERE code = 'BGU'), 'Catumbela', 'CAT'),
((SELECT id FROM provinces WHERE code = 'BGU'), 'Chongoroi', 'CHO'),
((SELECT id FROM provinces WHERE code = 'BGU'), 'Cubal', 'CUB'),
((SELECT id FROM provinces WHERE code = 'BGU'), 'Ganda', 'GAN'),
((SELECT id FROM provinces WHERE code = 'BGU'), 'Lobito', 'LOB');

-- BIÉ (BIE) - 9 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'BIE'), 'Andulo', 'AND'),
((SELECT id FROM provinces WHERE code = 'BIE'), 'Camacupa', 'CAM'),
((SELECT id FROM provinces WHERE code = 'BIE'), 'Catabola', 'CAT'),
((SELECT id FROM provinces WHERE code = 'BIE'), 'Chinguar', 'CHI'),
((SELECT id FROM provinces WHERE code = 'BIE'), 'Chitembo', 'CHT'),
((SELECT id FROM provinces WHERE code = 'BIE'), 'Cuemba', 'CUE'),
((SELECT id FROM provinces WHERE code = 'BIE'), 'Cunhinga', 'CUN'),
((SELECT id FROM provinces WHERE code = 'BIE'), 'Cuíto', 'CUI'),
((SELECT id FROM provinces WHERE code = 'BIE'), 'Nharea', 'NHA');

-- CABINDA (CAB) - 4 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'CAB'), 'Belize', 'BEL'),
((SELECT id FROM provinces WHERE code = 'CAB'), 'Buco-Zau', 'BUC'),
((SELECT id FROM provinces WHERE code = 'CAB'), 'Cabinda', 'CAB'),
((SELECT id FROM provinces WHERE code = 'CAB'), 'Cacongo', 'CAC');

-- CUANDO CUBANGO (CCU) - 9 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'CCU'), 'Calai', 'CAL'),
((SELECT id FROM provinces WHERE code = 'CCU'), 'Cuangar', 'CUA'),
((SELECT id FROM provinces WHERE code = 'CCU'), 'Cuchi', 'CUC'),
((SELECT id FROM provinces WHERE code = 'CCU'), 'Cuito Cuanavale', 'CCV'),
((SELECT id FROM provinces WHERE code = 'CCU'), 'Dirico', 'DIR'),
((SELECT id FROM provinces WHERE code = 'CCU'), 'Mavinga', 'MAV'),
((SELECT id FROM provinces WHERE code = 'CCU'), 'Menongue', 'MEN'),
((SELECT id FROM provinces WHERE code = 'CCU'), 'Nancova', 'NAN'),
((SELECT id FROM provinces WHERE code = 'CCU'), 'Rivungo', 'RIV');

-- CUANZA NORTE (CNO) - 10 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'CNO'), 'Ambaca', 'AMB'),
((SELECT id FROM provinces WHERE code = 'CNO'), 'Banga', 'BAN'),
((SELECT id FROM provinces WHERE code = 'CNO'), 'Bolongongo', 'BOL'),
((SELECT id FROM provinces WHERE code = 'CNO'), 'Cambambe', 'CAM'),
((SELECT id FROM provinces WHERE code = 'CNO'), 'Cazengo', 'CAZ'),
((SELECT id FROM provinces WHERE code = 'CNO'), 'Golungo Alto', 'GOL'),
((SELECT id FROM provinces WHERE code = 'CNO'), 'Gonguembo', 'GON'),
((SELECT id FROM provinces WHERE code = 'CNO'), 'Lucala', 'LUC'),
((SELECT id FROM provinces WHERE code = 'CNO'), 'Quiculungo', 'QUI'),
((SELECT id FROM provinces WHERE code = 'CNO'), 'Samba Cajú', 'SAM');

-- CUANZA SUL (CSU) - 12 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'CSU'), 'Amboim', 'AMB'),
((SELECT id FROM provinces WHERE code = 'CSU'), 'Cassongue', 'CAS'),
((SELECT id FROM provinces WHERE code = 'CSU'), 'Cela', 'CEL'),
((SELECT id FROM provinces WHERE code = 'CSU'), 'Conda', 'CON'),
((SELECT id FROM provinces WHERE code = 'CSU'), 'Ebo', 'EBO'),
((SELECT id FROM provinces WHERE code = 'CSU'), 'Libolo', 'LIB'),
((SELECT id FROM provinces WHERE code = 'CSU'), 'Mussende', 'MUS'),
((SELECT id FROM provinces WHERE code = 'CSU'), 'Porto Amboim', 'PAM'),
((SELECT id FROM provinces WHERE code = 'CSU'), 'Quibala', 'QUI'),
((SELECT id FROM provinces WHERE code = 'CSU'), 'Quilenda', 'QUL'),
((SELECT id FROM provinces WHERE code = 'CSU'), 'Seles', 'SEL'),
((SELECT id FROM provinces WHERE code = 'CSU'), 'Sumbe', 'SUM');

-- CUNENE (CUN) - 6 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'CUN'), 'Cahama', 'CAH'),
((SELECT id FROM provinces WHERE code = 'CUN'), 'Cuanhama', 'CUA'),
((SELECT id FROM provinces WHERE code = 'CUN'), 'Curoca', 'CUR'),
((SELECT id FROM provinces WHERE code = 'CUN'), 'Cuvelai', 'CUV'),
((SELECT id FROM provinces WHERE code = 'CUN'), 'Namacunde', 'NAM'),
((SELECT id FROM provinces WHERE code = 'CUN'), 'Ombadja', 'OMB');

-- HUAMBO (HUA) - 11 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'HUA'), 'Bailundo', 'BAI'),
((SELECT id FROM provinces WHERE code = 'HUA'), 'Cachiungo', 'CAC'),
((SELECT id FROM provinces WHERE code = 'HUA'), 'Caála', 'CAA'),
((SELECT id FROM provinces WHERE code = 'HUA'), 'Ecunha', 'ECU'),
((SELECT id FROM provinces WHERE code = 'HUA'), 'Huambo', 'HUA'),
((SELECT id FROM provinces WHERE code = 'HUA'), 'Londuimbali', 'LON'),
((SELECT id FROM provinces WHERE code = 'HUA'), 'Longonjo', 'LOG'),
((SELECT id FROM provinces WHERE code = 'HUA'), 'Mungo', 'MUN'),
((SELECT id FROM provinces WHERE code = 'HUA'), 'Chicala-Cholohanga', 'CHI'),
((SELECT id FROM provinces WHERE code = 'HUA'), 'Chinjenje', 'CHJ'),
((SELECT id FROM provinces WHERE code = 'HUA'), 'Ucuma', 'UCU');

-- HUÍLA (HUI) - 14 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'HUI'), 'Caconda', 'CAC'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Cacula', 'CAL'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Caluquembe', 'CLQ'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Chiange', 'CHI'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Chibia', 'CHB'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Chicomba', 'CHC'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Chipindo', 'CHP'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Cuvango', 'CUV'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Gambos', 'GAM'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Humpata', 'HUM'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Jamba', 'JAM'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Lubango', 'LUB'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Matala', 'MAT'),
((SELECT id FROM provinces WHERE code = 'HUI'), 'Quilengues', 'QUI');

-- LUANDA (LUA) - 9 municípios (incluindo os novos)
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'LUA'), 'Belas', 'BEL'),
((SELECT id FROM provinces WHERE code = 'LUA'), 'Cacuaco', 'CAC'),
((SELECT id FROM provinces WHERE code = 'LUA'), 'Cazenga', 'CAZ'),
((SELECT id FROM provinces WHERE code = 'LUA'), 'Ícolo e Bengo', 'ICB'),
((SELECT id FROM provinces WHERE code = 'LUA'), 'Luanda', 'LUA'),
((SELECT id FROM provinces WHERE code = 'LUA'), 'Quiçama', 'QUI'),
((SELECT id FROM provinces WHERE code = 'LUA'), 'Talatona', 'TAL'),
((SELECT id FROM provinces WHERE code = 'LUA'), 'Viana', 'VIA'),
((SELECT id FROM provinces WHERE code = 'LUA'), 'Kilamba Kiaxi', 'KIL');

-- LUNDA NORTE (LNO) - 10 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'LNO'), 'Cambulo', 'CAM'),
((SELECT id FROM provinces WHERE code = 'LNO'), 'Capenda Camulemba', 'CAP'),
((SELECT id FROM provinces WHERE code = 'LNO'), 'Caungula', 'CAU'),
((SELECT id FROM provinces WHERE code = 'LNO'), 'Chitato', 'CHI'),
((SELECT id FROM provinces WHERE code = 'LNO'), 'Cuango', 'CUA'),
((SELECT id FROM provinces WHERE code = 'LNO'), 'Cuílo', 'CUI'),
((SELECT id FROM provinces WHERE code = 'LNO'), 'Lubalo', 'LUB'),
((SELECT id FROM provinces WHERE code = 'LNO'), 'Lucapa', 'LUC'),
((SELECT id FROM provinces WHERE code = 'LNO'), 'Xá-Muteba', 'XAM'),
((SELECT id FROM provinces WHERE code = 'LNO'), 'Lóvua', 'LOV');

-- LUNDA SUL (LSU) - 4 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'LSU'), 'Cacolo', 'CAC'),
((SELECT id FROM provinces WHERE code = 'LSU'), 'Dala', 'DAL'),
((SELECT id FROM provinces WHERE code = 'LSU'), 'Muconda', 'MUC'),
((SELECT id FROM provinces WHERE code = 'LSU'), 'Saurimo', 'SAU');

-- MALANJE (MAL) - 14 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'MAL'), 'Cacuso', 'CAC'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Calandula', 'CAL'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Cambundi-Catembo', 'CAM'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Cangandala', 'CAN'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Caombo', 'CAO'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Cuaba Nzoji', 'CUA'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Cunda-Dia-Baze', 'CUN'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Luquembo', 'LUQ'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Malanje', 'MAL'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Marimba', 'MAR'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Massango', 'MAS'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Mucari', 'MUC'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Quela', 'QUE'),
((SELECT id FROM provinces WHERE code = 'MAL'), 'Quirima', 'QUI');

-- MOXICO (MOX) - 9 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'MOX'), 'Alto Zambeze', 'ALZ'),
((SELECT id FROM provinces WHERE code = 'MOX'), 'Bundas', 'BUN'),
((SELECT id FROM provinces WHERE code = 'MOX'), 'Camanongue', 'CAM'),
((SELECT id FROM provinces WHERE code = 'MOX'), 'Cameia', 'CME'),
((SELECT id FROM provinces WHERE code = 'MOX'), 'Léua', 'LEU'),
((SELECT id FROM provinces WHERE code = 'MOX'), 'Luacano', 'LUA'),
((SELECT id FROM provinces WHERE code = 'MOX'), 'Luau', 'LUU'),
((SELECT id FROM provinces WHERE code = 'MOX'), 'Luchazes', 'LUC'),
((SELECT id FROM provinces WHERE code = 'MOX'), 'Moxico', 'MOX');

-- NAMIBE (NAM) - 5 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'NAM'), 'Bibala', 'BIB'),
((SELECT id FROM provinces WHERE code = 'NAM'), 'Camucuio', 'CAM'),
((SELECT id FROM provinces WHERE code = 'NAM'), 'Moçâmedes', 'MOC'),
((SELECT id FROM provinces WHERE code = 'NAM'), 'Tômbwa', 'TOM'),
((SELECT id FROM provinces WHERE code = 'NAM'), 'Virei', 'VIR');

-- UÍGE (UIG) - 16 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'UIG'), 'Alto Cauale', 'ALC'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Ambuíla', 'AMB'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Bembe', 'BEM'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Buengas', 'BUE'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Bungo', 'BUN'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Damba', 'DAM'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Maquela do Zombo', 'MAQ'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Milunga', 'MIL'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Mucaba', 'MUC'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Negage', 'NEG'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Puri', 'PUR'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Quimbele', 'QUI'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Quitexe', 'QUT'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Sanza Pombo', 'SAN'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Songo', 'SON'),
((SELECT id FROM provinces WHERE code = 'UIG'), 'Uíge', 'UIG');

-- ZAIRE (ZAI) - 6 municípios
INSERT INTO municipalities (province_id, name, code) VALUES
((SELECT id FROM provinces WHERE code = 'ZAI'), 'Cuimba', 'CUI'),
((SELECT id FROM provinces WHERE code = 'ZAI'), 'M''Banza Congo', 'MBC'),
((SELECT id FROM provinces WHERE code = 'ZAI'), 'N''Zeto', 'NZE'),
((SELECT id FROM provinces WHERE code = 'ZAI'), 'Nóqui', 'NOQ'),
((SELECT id FROM provinces WHERE code = 'ZAI'), 'Soyo', 'SOY'),
((SELECT id FROM provinces WHERE code = 'ZAI'), 'Tomboco', 'TOM');