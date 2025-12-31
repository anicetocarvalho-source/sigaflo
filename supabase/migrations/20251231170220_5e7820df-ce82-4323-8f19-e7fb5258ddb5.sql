-- Inserir comunas de Angola - Parte 1 (Bengo, Benguela, Bié)

-- BENGO - Comunas por município
-- Ambriz
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Ambriz'), 'Ambriz'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Ambriz'), 'Bela Vista'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Ambriz'), 'Tabi');

-- Dande
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Dande'), 'Caxito'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Dande'), 'Mabubas'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Dande'), 'Úcua'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Dande'), 'Quicabo');

-- Dembos
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Dembos'), 'Quibaxe'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Dembos'), 'Piri'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Dembos'), 'Paredes');

-- Nambuangongo
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Nambuangongo'), 'Nambuangongo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Nambuangongo'), 'Muxaluando');

-- Pango Aluquém
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Pango Aluquém'), 'Pango Aluquém'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Pango Aluquém'), 'Cabiri');

-- Bula Atumba
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGO' AND m.name = 'Bula Atumba'), 'Bula Atumba');

-- BENGUELA - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Benguela'), 'Benguela'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Benguela'), 'Calumbo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Benguela'), 'Dombe Grande'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Benguela'), 'Equimina');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Lobito'), 'Lobito'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Lobito'), 'Canjala'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Lobito'), 'Egipto Praia');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Catumbela'), 'Catumbela'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Catumbela'), 'Biópio'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Catumbela'), 'Praia Bebé'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Catumbela'), 'Ganda');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Baía Farta'), 'Baía Farta'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Baía Farta'), 'Calohanga'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Baía Farta'), 'Dombe Grande');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Balombo'), 'Balombo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Balombo'), 'Chingongo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Bocoio'), 'Bocoio'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Bocoio'), 'Cubal do Lumbo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Bocoio'), 'Passe'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Bocoio'), 'Monte Belo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Caimbambo'), 'Caimbambo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Caimbambo'), 'Catengue');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Chongoroi'), 'Chongoroi'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Chongoroi'), 'Bolonguera');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Cubal'), 'Cubal'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Cubal'), 'Capupa'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Cubal'), 'Iambala'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Cubal'), 'Tumbulo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Ganda'), 'Ganda'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Ganda'), 'Babaera'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Ganda'), 'Casseque'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Ganda'), 'Chicôco'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BGU' AND m.name = 'Ganda'), 'Ebanga');

-- BIÉ - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Cuíto'), 'Cuíto'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Cuíto'), 'Cambândua'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Cuíto'), 'Trumba');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Andulo'), 'Andulo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Andulo'), 'Calucinga'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Andulo'), 'Cassumbe');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Camacupa'), 'Camacupa'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Camacupa'), 'Ringoma'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Camacupa'), 'Umpulo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Catabola'), 'Catabola'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Catabola'), 'Chiuca'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Catabola'), 'Caiundo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Chinguar'), 'Chinguar'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Chinguar'), 'Cutato');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Chitembo'), 'Chitembo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Chitembo'), 'Cachipoque');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Cuemba'), 'Cuemba'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Cuemba'), 'Sachinemuna');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Cunhinga'), 'Cunhinga');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Nharea'), 'Nharea'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'BIE' AND m.name = 'Nharea'), 'Munhango');