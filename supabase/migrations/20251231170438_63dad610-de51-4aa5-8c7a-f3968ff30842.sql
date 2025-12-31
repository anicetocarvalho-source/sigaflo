-- Inserir comunas de Angola - Parte 2 (Cabinda, Cuando Cubango, Cuanza Norte, Cuanza Sul)

-- CABINDA - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CAB' AND m.name = 'Cabinda'), 'Cabinda'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CAB' AND m.name = 'Cabinda'), 'Malembo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CAB' AND m.name = 'Cabinda'), 'Tando-Zinze');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CAB' AND m.name = 'Cacongo'), 'Cacongo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CAB' AND m.name = 'Cacongo'), 'Dinge'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CAB' AND m.name = 'Cacongo'), 'Massabi');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CAB' AND m.name = 'Belize'), 'Belize'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CAB' AND m.name = 'Belize'), 'Luali');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CAB' AND m.name = 'Buco-Zau'), 'Buco-Zau'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CAB' AND m.name = 'Buco-Zau'), 'Inhuca'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CAB' AND m.name = 'Buco-Zau'), 'Necuto');

-- CUANDO CUBANGO - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Menongue'), 'Menongue'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Menongue'), 'Caiundo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Menongue'), 'Missombo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Calai'), 'Calai');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Cuangar'), 'Cuangar');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Cuchi'), 'Cuchi'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Cuchi'), 'Cutato');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Cuito Cuanavale'), 'Cuito Cuanavale'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Cuito Cuanavale'), 'Baixo Longa'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Cuito Cuanavale'), 'Longa');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Dirico'), 'Dirico'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Dirico'), 'Mucusso');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Mavinga'), 'Mavinga'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Mavinga'), 'Luiana');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Nancova'), 'Nancova');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CCU' AND m.name = 'Rivungo'), 'Rivungo');

-- CUANZA NORTE - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Cazengo'), 'N''Dalatando'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Cazengo'), 'Zanga');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Ambaca'), 'Ambaca'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Ambaca'), 'Tango');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Banga'), 'Banga'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Banga'), 'Quiculungo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Bolongongo'), 'Bolongongo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Cambambe'), 'Cambambe'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Cambambe'), 'Dondo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Golungo Alto'), 'Golungo Alto'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Golungo Alto'), 'Cambondo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Gonguembo'), 'Gonguembo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Lucala'), 'Lucala');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Quiculungo'), 'Quiculungo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CNO' AND m.name = 'Samba Cajú'), 'Samba Cajú');

-- CUANZA SUL - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Sumbe'), 'Sumbe'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Sumbe'), 'Gangula'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Sumbe'), 'Gungo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Amboim'), 'Gabela'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Amboim'), 'Assango'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Amboim'), 'Uku-Seles');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Cassongue'), 'Cassongue'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Cassongue'), 'Dumbi'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Cassongue'), 'Atome');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Cela'), 'Waku-Kungo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Cela'), 'Quirimbo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Conda'), 'Conda'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Conda'), 'Cunjo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Ebo'), 'Ebo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Ebo'), 'Quissongo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Libolo'), 'Calulo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Libolo'), 'Munenga'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Libolo'), 'Cabuta'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Libolo'), 'Quissongo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Mussende'), 'Mussende'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Mussende'), 'Quiongua');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Porto Amboim'), 'Porto Amboim'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Porto Amboim'), 'Capolo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Quibala'), 'Quibala'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Quibala'), 'Lonhe');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Quilenda'), 'Quilenda');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Seles'), 'Seles'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CSU' AND m.name = 'Seles'), 'Amboíva');