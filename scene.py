# Run as: blender -b <filename> -P <this_script> -- <image_path>
import bpy, sys, os

def hex_to_rgb(value):
    return tuple(int(value[i:i+2], 16) for i in (0, 2 ,4))

# Assume the last argument is image path

argv = sys.argv
filename = argv[argv.index("--") + 1]
color = hex_to_rgb(argv[argv.index("--") + 2])

# charObj = bpy.data.objects['Cube']
# charMat = charObj.material_slots['Material'].material
# charMat.diffuse_color = (color[0]/255, color[1]/255, color[2]/255)
# charMat.specular_color = (color[0]/255, color[1]/255, color[2]/255)

lamps = [obj.data for obj in bpy.context.scene.objects if obj.type == 'LAMP']
materials = bpy.data.materials

for lamp in lamps:
    if bpy.data.groups.get(lamp.name) is not None:
        for mat in materials:
            for obj in bpy.data.objects:
                if obj.type =='CAMERA':
                    for mesh in bpy.data.meshes:
                        bpy.context.scene.objects['Cube'].data = mesh
                        bpy.context.scene.camera = obj
                        bpy.context.scene.render.layers['RenderLayer'].light_override = bpy.data.groups.get(lamp.name)
                        bpy.context.scene.render.layers['RenderLayer'].material_override = mat
                        bpy.context.scene.render.filepath = mesh.name + '_' + obj.name + '_' + mat.name + '_' + lamp.name + '_' + filename
                        bpy.ops.render.render(write_still=True)
