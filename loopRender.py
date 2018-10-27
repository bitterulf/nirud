import imp, sys, os, bpy

models = ['freakhat2', 'freakhat3', 'freakhat4', 'freakhat5', 'freakhat6', 'freakhat7', 'freakhat8', 'freakhat9']
materials = ['Skin1', 'Skin2', 'Skin3', 'Skin4']

for model in models:
    for material in materials:
        bpy.context.scene.objects.active = bpy.data.objects[model]
        bpy.context.scene.objects.active.hide_render = False
        bpy.context.scene.objects.active.data.materials[0] = bpy.data.materials.get(material)

        scene = bpy.data.scenes["Scene"]
        scene.render.resolution_percentage = 25
        bpy.context.scene.render.filepath = '//freaks/' + material + '_' + model + '_freak.png'
        bpy.ops.render.render( write_still=True )
        bpy.context.scene.objects.active.hide_render = True
