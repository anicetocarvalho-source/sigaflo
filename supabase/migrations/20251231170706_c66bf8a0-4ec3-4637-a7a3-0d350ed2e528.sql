-- Inserir comunas de Angola - Parte 3 (Cunene, Huambo, Huíla)

-- CUNENE - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CUN' AND m.name = 'Cuanhama'), 'Ondjiva'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CUN' AND m.name = 'Cuanhama'), 'Evale'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CUN' AND m.name = 'Cuanhama'), 'Môngua');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CUN' AND m.name = 'Cahama'), 'Cahama'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CUN' AND m.name = 'Cahama'), 'Otchinjau');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CUN' AND m.name = 'Curoca'), 'Curoca'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CUN' AND m.name = 'Curoca'), 'Oncócua');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CUN' AND m.name = 'Cuvelai'), 'Cuvelai');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CUN' AND m.name = 'Namacunde'), 'Namacunde');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CUN' AND m.name = 'Ombadja'), 'Xangongo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'CUN' AND m.name = 'Ombadja'), 'Humbe');

-- HUAMBO - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Huambo'), 'Huambo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Huambo'), 'Calima'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Huambo'), 'Chipipa');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Bailundo'), 'Bailundo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Bailundo'), 'Bimbe'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Bailundo'), 'Lunge'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Bailundo'), 'Hengue');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Caála'), 'Caála'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Caála'), 'Cuima'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Caála'), 'Calenga');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Cachiungo'), 'Cachiungo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Ecunha'), 'Ecunha'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Ecunha'), 'Cuando');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Londuimbali'), 'Londuimbali'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Londuimbali'), 'Lepi');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Longonjo'), 'Longonjo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Longonjo'), 'Catabola');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Mungo'), 'Mungo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Chicala-Cholohanga'), 'Chicala-Cholohanga');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Chinjenje'), 'Chinjenje');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUA' AND m.name = 'Ucuma'), 'Ucuma');

-- HUÍLA - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Lubango'), 'Lubango'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Lubango'), 'Arimba'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Lubango'), 'Huíla'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Lubango'), 'Quilemba');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Caconda'), 'Caconda'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Caconda'), 'Gungue'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Caconda'), 'Uaba');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Cacula'), 'Cacula');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Caluquembe'), 'Caluquembe'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Caluquembe'), 'Ngola');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Chiange'), 'Chiange'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Chiange'), 'Bambi');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Chibia'), 'Chibia'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Chibia'), 'Capunda'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Chibia'), 'Jau'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Chibia'), 'Quihita');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Chicomba'), 'Chicomba'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Chicomba'), 'Cutenda');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Chipindo'), 'Chipindo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Chipindo'), 'Bambi');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Cuvango'), 'Cuvango'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Cuvango'), 'Galangue'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Cuvango'), 'Vionga');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Gambos'), 'Chianje'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Gambos'), 'Chibemba');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Humpata'), 'Humpata'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Humpata'), 'Palanca');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Jamba'), 'Jamba'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Jamba'), 'Cassinga');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Matala'), 'Matala'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Matala'), 'Capelongo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Matala'), 'Mulondo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Quilengues'), 'Quilengues'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Quilengues'), 'Impulo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'HUI' AND m.name = 'Quilengues'), 'Dinde');