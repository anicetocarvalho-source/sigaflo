-- Inserir comunas de Angola - Parte 5 (Moxico, Namibe, Uíge, Zaire)

-- MOXICO - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Moxico'), 'Luena'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Moxico'), 'Cameia');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Alto Zambeze'), 'Cazombo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Alto Zambeze'), 'Macondo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Bundas'), 'Bundas');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Camanongue'), 'Camanongue');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Cameia'), 'Cameia');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Léua'), 'Léua'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Léua'), 'Macondo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Luacano'), 'Luacano');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Luau'), 'Luau'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Luau'), 'Jimbe');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MOX' AND m.name = 'Luchazes'), 'Luchazes');

-- NAMIBE - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Moçâmedes'), 'Moçâmedes'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Moçâmedes'), 'Forte Santa Rita'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Moçâmedes'), 'Lucira');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Bibala'), 'Bibala'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Bibala'), 'Caitou'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Bibala'), 'Lola');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Camucuio'), 'Camucuio'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Camucuio'), 'Caraculo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Tômbwa'), 'Tômbwa'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Tômbwa'), 'Baía dos Tigres'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Tômbwa'), 'Iona');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Virei'), 'Virei'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'NAM' AND m.name = 'Virei'), 'Yona');

-- UÍGE - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Uíge'), 'Uíge'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Uíge'), 'Quitexe');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Alto Cauale'), 'Alto Cauale');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Ambuíla'), 'Ambuíla');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Bembe'), 'Bembe'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Bembe'), 'Sacandica');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Buengas'), 'Buengas');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Bungo'), 'Bungo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Damba'), 'Damba'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Damba'), 'Nsoso');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Maquela do Zombo'), 'Maquela do Zombo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Maquela do Zombo'), 'Quibocolo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Maquela do Zombo'), 'Sacandica');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Milunga'), 'Milunga');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Mucaba'), 'Mucaba');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Negage'), 'Negage'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Negage'), 'Dimuca');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Puri'), 'Puri');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Quimbele'), 'Quimbele'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Quimbele'), 'Cuilo-Pombo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Quitexe'), 'Quitexe');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Sanza Pombo'), 'Sanza Pombo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'UIG' AND m.name = 'Songo'), 'Songo');

-- ZAIRE - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'M''Banza Congo'), 'M''Banza Congo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'M''Banza Congo'), 'Luvo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'M''Banza Congo'), 'Madimba');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'Cuimba'), 'Cuimba');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'N''Zeto'), 'N''Zeto'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'N''Zeto'), 'Mussera'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'N''Zeto'), 'Quizomba');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'Nóqui'), 'Nóqui');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'Soyo'), 'Soyo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'Soyo'), 'Mangue Grande'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'Soyo'), 'Pedra de Feitiço');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'Tomboco'), 'Tomboco'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'ZAI' AND m.name = 'Tomboco'), 'Quinzau');