-- Inserir comunas de Angola - Parte 4 (Luanda, Lundas, Malanje)

-- LUANDA - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Luanda'), 'Ingombota'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Luanda'), 'Maianga'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Luanda'), 'Rangel'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Luanda'), 'Samba'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Luanda'), 'Sambizanga');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Belas'), 'Belas'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Belas'), 'Benfica'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Belas'), 'Futungo de Belas'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Belas'), 'Mussulo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Belas'), 'Ramiros');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Cacuaco'), 'Cacuaco'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Cacuaco'), 'Funda'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Cacuaco'), 'Kikolo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Cazenga'), 'Cazenga'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Cazenga'), 'Tala Hady'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Cazenga'), 'Hoji ya Henda');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Ícolo e Bengo'), 'Catete'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Ícolo e Bengo'), 'Bom Jesus');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Quiçama'), 'Muxima'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Quiçama'), 'Demba Chio'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Quiçama'), 'Cabo Ledo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Talatona'), 'Talatona'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Talatona'), 'Camama'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Talatona'), 'Lar do Patriota');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Viana'), 'Viana'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Viana'), 'Calumbo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Viana'), 'Zango');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Kilamba Kiaxi'), 'Kilamba Kiaxi'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Kilamba Kiaxi'), 'Palanca'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LUA' AND m.name = 'Kilamba Kiaxi'), 'Golf');

-- LUNDA NORTE - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Lucapa'), 'Lucapa'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Lucapa'), 'Canzar');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Cambulo'), 'Cambulo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Capenda Camulemba'), 'Capenda Camulemba');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Caungula'), 'Caungula');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Chitato'), 'Chitato'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Chitato'), 'Luremo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Cuango'), 'Cuango'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Cuango'), 'Luremo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Cuílo'), 'Cuílo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Lubalo'), 'Lubalo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Xá-Muteba'), 'Xá-Muteba');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LNO' AND m.name = 'Lóvua'), 'Lóvua');

-- LUNDA SUL - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LSU' AND m.name = 'Saurimo'), 'Saurimo'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LSU' AND m.name = 'Saurimo'), 'Sombo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LSU' AND m.name = 'Cacolo'), 'Cacolo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LSU' AND m.name = 'Dala'), 'Dala');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'LSU' AND m.name = 'Muconda'), 'Muconda');

-- MALANJE - Comunas
INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Malanje'), 'Malanje'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Malanje'), 'Ngola Luíje'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Malanje'), 'Cambaxe');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Cacuso'), 'Cacuso'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Cacuso'), 'Lombe'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Cacuso'), 'Pungo Andongo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Calandula'), 'Calandula'),
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Calandula'), 'Cuale');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Cambundi-Catembo'), 'Cambundi-Catembo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Cangandala'), 'Cangandala');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Caombo'), 'Caombo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Cuaba Nzoji'), 'Cuaba Nzoji');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Cunda-Dia-Baze'), 'Cunda-Dia-Baze');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Luquembo'), 'Luquembo');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Marimba'), 'Marimba');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Massango'), 'Massango');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Mucari'), 'Mucari');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Quela'), 'Quela');

INSERT INTO communes (municipality_id, name) VALUES
((SELECT m.id FROM municipalities m JOIN provinces p ON m.province_id = p.id WHERE p.code = 'MAL' AND m.name = 'Quirima'), 'Quirima');