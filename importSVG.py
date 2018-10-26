import imp, sys, os, bpy

bpy.ops.object.select_all(action='DESELECT')
bpy.data.objects['Cube'].select = True

bpy.ops.object.delete()

bpy.ops.import_curve.svg (filepath="outputText.svg")

bpy.ops.object.select_all(action='DESELECT')
bpy.data.objects['Curve'].select = True
bpy.context.scene.objects.active = bpy.data.objects['Curve']

bpy.context.scene.objects.active.scale = (20, 20, 20)

# bpy.ops.object.origin_set(type='ORIGIN_CENTER_OF_MASS')
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
bpy.context.scene.objects.active.location.x = 0
bpy.context.scene.objects.active.location.y = 0
bpy.context.scene.objects.active.location.z = 0

bpy.data.materials['SVGMat.001'].diffuse_color = (0.5, 0, 0)
bpy.data.materials['SVGMat.001'].specular_color = (0, 0, 1)

pi = 3.14159265

scene = bpy.data.scenes["Scene"]

scene.camera.rotation_mode = 'XYZ'
scene.camera.rotation_euler[0] = 0*(pi/180.0)
scene.camera.rotation_euler[1] = 0*(pi/180.0)
scene.camera.rotation_euler[2] = 0*(pi/180.0)

scene.camera.location.x = 0
scene.camera.location.y = 0
scene.camera.location.z = 3

scene.render.resolution_x = 512
scene.render.resolution_y = 512
scene.render.resolution_percentage = 100
bpy.context.scene.render.layers["RenderLayer"].use_sky = False
# bpy.context.scene.render.use_antialiasing = False
bpy.context.scene.render.use_freestyle = True
scene.render.line_thickness_mode = "RELATIVE"
bpy.data.linestyles["LineStyle"].color = (0, 1, 0)
bpy.data.linestyles["LineStyle"].thickness = 1

bpy.context.scene.render.filepath = '//output.png'
bpy.ops.render.render( write_still=True )

scene.render.resolution_percentage = 50

bpy.context.scene.render.filepath = '//output_small.png'
bpy.ops.render.render( write_still=True )
