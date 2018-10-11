import imp, sys, os, bpy
tiledImporter = imp.load_source('module.name', '/home/dev/workspace/nirud/tiledImporter.py')

print(tiledImporter.importMap('test.json'))


for tile in tiledImporter.importMap('test.json'):
    if bpy.data.groups.get(tile['model']) is not None:
        bpy.ops.object.add(type='EMPTY')
        bpy.context.active_object.name = str(tile['x']) + '_' + str(tile['y']) + '_' + tile['model']
        bpy.context.active_object.location = [tile['x'], tile['y'], 0]
        bpy.context.active_object.dupli_type = 'GROUP'
        bpy.context.active_object.dupli_group = bpy.data.groups.get(tile['model'])

