import sys, os, json

def importMap(fileName):
    json1_file = open(fileName)
    json1_str = json1_file.read()
    json1_data = json.loads(json1_str)

    tileTypes = {}

    result = [];

    for tileset in json1_data['tilesets']:
        for tilePropertyId in tileset['tileproperties']:
            tileProperty = tileset['tileproperties'][tilePropertyId]
            tileTypes[int(tilePropertyId) + tileset['firstgid']] = tileProperty

    for layer in json1_data['layers']:
        if layer['type'] == 'tilelayer':
            for y in range(layer['height']):
                for x in range(layer['width']):
                    tileContent = layer['data'][y * layer['width'] + x];
                    if tileContent != 0:
                        if (tileTypes[tileContent] and tileTypes[tileContent]['model']):
                            model = tileTypes[tileContent]['model']
                            result.append({'x': x, 'y': y, 'model': model})
    return result
