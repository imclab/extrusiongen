/**
 * @author Ikaros Kappler
 * @date 2013-08-14
 * @version 1.0.0
 **/

IKRS.PreviewCanvasHandler = function( bezierCanvasHandler,
				      preview_canvas_width,
				      preview_canvas_height 
				    ) {

// var preview_canvas_width  = 512;
// var preview_canvas_height = 768;

    this.bezierCanvasHandler = bezierCanvasHandler;

    this.preview_canvas   = document.getElementById("preview_canvas");
    this.preview_renderer = new THREE.WebGLRenderer( { "canvas" : this.preview_canvas } );

    //this.preview_mesh; // will be initialized later
    this.preview_meshes = [];
    this.preview_scene = new THREE.Scene(); 
    this.preview_camera = new THREE.PerspectiveCamera( 75, 
						       preview_canvas_width/preview_canvas_height,  
						       0.1, 
						       2000 
						     ); 
    
    // create a point light
    this.preview_pointLight =
	new THREE.PointLight(0xFFFFFF);
    
    // set its position
    this.preview_pointLight.position.x = 10;
    this.preview_pointLight.position.y = 50;
    this.preview_pointLight.position.z = 600;

    // add to the scene
    this.preview_scene.add( this.preview_pointLight );
    
    this.preview_canvas.onmousedown = this.preview_mouseDownHandler;
    this.preview_canvas.onmouseup   = this.preview_mouseUpHandler;
    this.preview_canvas.onmousemove = this.preview_mouseMoveHandler;

    
    //window.alert( "preview_canvas.width=" +  preview_canvas.width + ", preview_canvas.height=" + preview_canvas.height );
    this.preview_renderer.setSize( preview_canvas_width, 
				   preview_canvas_height 
				 ); 
    
    //this.bezierCanvas

    document.body.appendChild( this.preview_renderer.domElement );


    // Create a backward-link to this so the canvas events have access!
    this.preview_canvas.previewCanvasHandler = this;

}

IKRS.PreviewCanvasHandler.prototype = new IKRS.Object();
IKRS.PreviewCanvasHandler.prototype.constructor = IKRS.PreviewCanvasHandler;

IKRS.PreviewCanvasHandler.prototype.getMeshes = function() {
    return this.preview_meshes;
}

IKRS.PreviewCanvasHandler.prototype.preview_mouseMoveHandler = function ( e ) {
  // window.alert( "clicked. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
  
  if( this.previewCanvasHandler.latestMouseDownPosition ) {
      
      //this.previewCanvasHandler.preview_mesh.rotation.y += (0.01 * (this.previewCanvasHandler.latestMouseDragPosition.x - e.pageX)); 
      //this.previewCanvasHandler.preview_mesh.rotation.x += (0.01 * (this.previewCanvasHandler.latestMouseDragPosition.y - e.pageY)); 
      for( var i = 0; i < previewCanvasHandler.preview_meshes.length; i++ ) {

	  this.previewCanvasHandler.preview_meshes[i].rotation.y += (0.01 * (this.previewCanvasHandler.latestMouseDragPosition.x - e.pageX)); 
	  this.previewCanvasHandler.preview_meshes[i].rotation.x += (0.01 * (this.previewCanvasHandler.latestMouseDragPosition.y - e.pageY)); 

      }


    this.previewCanvasHandler.latestMouseDragPosition = new THREE.Vector2( e.pageX, e.pageY ); 

    //preview_render();    
  } 
};


IKRS.PreviewCanvasHandler.prototype.preview_mouseDownHandler = function( e ) {
  // window.alert( "clicked. Event: " + e + ", e.pageX=" + e.pageX + ", e.pageY=" + e.pageY );
  this.previewCanvasHandler.latestMouseDownPosition = new THREE.Vector2( e.pageX, e.pageY ); 
  this.previewCanvasHandler.latestMouseDragPosition = new THREE.Vector2( e.pageX, e.pageY ); 
}

IKRS.PreviewCanvasHandler.prototype.preview_mouseUpHandler = function( e ) {
  // Clear mouse down position
  this.previewCanvasHandler.latestMouseDownPosition = null;
}







IKRS.PreviewCanvasHandler.prototype.preview_rebuild_model = function() {


    // Fetch bezier path from bezier canvas handler
    var shapedPath           = this.bezierCanvasHandler.getBezierPath();
    //var shapedPathBounds     = shapedPath.computeBoundingBox();

    //var shapePoints          = [];
    // Make a circle
    var circleSegmentCount   = document.forms["mesh_form"].elements["shape_segments"].value; 
    var pathSegments         = document.forms["mesh_form"].elements["path_segments"].value;


    if( circleSegmentCount*pathSegments > 400*400 ) {
	var confirmed = window.confirm( "The total face count is more than 160000 with these settings.\n" +
					"This might render and process VERY slowly.\n" +
					"\n" +
					"Do you want to continue though?" );
	
	if( !confirmed )
	    return;
    }

    var build_negative_mesh   = document.forms["mesh_form"].elements["build_negative_mesh"].checked;
    var mesh_hull_strength    = document.forms["mesh_form"].elements["mesh_hull_strength"].value;
    var mesh_close_path_begin = document.forms["mesh_form"].elements["mesh_close_path_begin"].checked;
    var mesh_close_path_end   = document.forms["mesh_form"].elements["mesh_close_path_end"].checked;
    var wireFrame             = document.forms["mesh_form"].elements["wireframe"].checked; 
    var triangulate           = document.forms["mesh_form"].elements["triangulate"].checked;
 
    var split_shape           = document.forms["mesh_form"].elements["split_shape"].checked;

    // Convert numeric text values to numbers!
    mesh_hull_strength  = parseInt( mesh_hull_strength );
    circleSegmentCount  = parseInt( circleSegmentCount );
    pathSegments        = parseInt( pathSegments );
    //var circleRadius    = shapedPathBounds.getWidth();
    
    var new_mesh = this._buildMeshFromSettings( shapedPath,
						circleSegmentCount,
						pathSegments,
						build_negative_mesh,
						mesh_hull_strength,
						mesh_close_path_begin,
						mesh_close_path_end,
						wireFrame,
						triangulate,
						split_shape
						);

    new_mesh.position.y  = 150;
    new_mesh.position.z  = -250;
    new_mesh.overdraw    = true;
    new_mesh.doubleSided = false;  // true
    
    // Apply view settings
    var viewSettings = this._getViewSettings();
    if( viewSettings &&
	viewSettings.rotation &&
	viewSettings.scale ) {
	
	//new_mesh.rotation.setFromRotationMatrix( viewSettings.rotation );
	new_mesh.rotation.set( viewSettings.rotation.x,
			       viewSettings.rotation.y,
			       viewSettings.rotation.z 
			     );
	new_mesh.scale.set( viewSettings.scale.x,
			    viewSettings.scale.y,
			    viewSettings.scale.z
			  );

    } else {

	new_mesh.scale.multiplyScalar( 1.5 );
	new_mesh.rotation.x = -1.38;

    }
    
    this._clearScene();
    
    // Remove old mesh?
    //if( this.preview_mesh ) {
    /*
    if( this.preview_meshes.length != 0 ) {
	
	var old_mesh = this.preview_meshes[ 0 ];
	//this.preview_scene.remove( this.preview_mesh );
	
	for( var i = 0; i < this.preview_meshes.length; i++ ) {
	    
	    this.preview_scene.remove( this.preview_meshes[i] );

	}
	this.preview_meshes =[];

	// Keep old rotation	
	new_mesh.rotation.x = old_mesh.rotation.x;
	new_mesh.rotation.y = old_mesh.rotation.y;
	
	new_mesh.scale.x    = old_mesh.scale.x;
	new_mesh.scale.y    = old_mesh.scale.y;
	new_mesh.scale.z    = old_mesh.scale.z;
    } else {

	// Scale a bit bigger than 1.0 (looks better with the bezier view)
	new_mesh.scale.multiplyScalar( 1.5 );
	
	new_mesh.rotation.x = -1.38;

    }
    */

    this.preview_scene.add( new_mesh );
    //this.preview_mesh = new_mesh;
    this.preview_meshes.push( new_mesh );


}

IKRS.PreviewCanvasHandler.prototype._buildMeshFromSettings = function( shapedPath,
								       circleSegmentCount,
								       pathSegments,
								       build_negative_mesh,
								       mesh_hull_strength,
								       mesh_close_path_begin,
								       mesh_close_path_end,
								       wireFrame,
								       triangulate,
								       split_shape
								     ) {
    
    var shapedPathBounds     = shapedPath.computeBoundingBox();
    var circleRadius         = shapedPathBounds.getWidth();
    
    // The shape offset on the lower plane.
    // This will be the (x,y) translation of the final mesh; default is (0,0) if non-split.
    var mesh_offset;
    if( split_shape )
	mesh_offset = new THREE.Vector2( 0, 0 ); // -100 );
    else
	mesh_offset = new THREE.Vector2( 0, 0 );
    
    /*
    // Convert text values to numbers!
    mesh_hull_strength = parseInt( mesh_hull_strength );
    
    //window.alert( "mesh_close_path_begin=" + mesh_close_path_begin );
    
    // Use the x value (=radius) of the first path point as circle radius
    var circleRadius       = shapedPathBounds.getWidth(); //shapedPath.getPoint( 0.0 ).x;

    // If the mesh is split, the shape will be split into two halfs. 
    // -> eventually divide the shape's segment count by two.
    var localSegmentCount = ( split_shape ? circleSegmentCount/2 : circleSegmentCount );
    for( i = 0; i <= localSegmentCount; i++ ) {
	var pct = i * (1.0/localSegmentCount);
	var angle;
	if( split_shape ) angle = Math.PI/2.0 + Math.PI * pct;
	else              angle = Math.PI/2.0 + Math.PI * pct * 2.0;
	   
	    
	shapePoints.push( new THREE.Vector3( Math.sin( angle ) * circleRadius,
					     Math.cos( angle ) * circleRadius,
					     0
					   )
			);
    }
    */
    
    shapePoints = this._createCircleShapePoints( (split_shape ? circleSegmentCount/2 : circleSegmentCount),
						 circleRadius,
						 -Math.PI/2.0,                            // startAngle
						 (split_shape ? Math.PI : Math.PI * 2.0)  // arc
					       );
					       
    

    var extrusionShape = new THREE.Shape( shapePoints );

    // Extract visual path length (pixels) from bezier's bounding box.
    var pathLength     = shapedPathBounds.getHeight();

    // HINT: THREE.path points do not recognize the z component!
    var pathPoints = [];  
    // Note: the new implementation ALWAYS uses the curved path.
    //       As a curve bend of 0 DEG is not allowd (division by zereo) use a minimal
    //       non-zero angle (e.g. 0.01 DEG).
    var pathBendAngle = Math.max( document.getElementById( "preview_bend" ).value,
				  0.01
				);
    //var buildCurvedPath = true; // (pathBendAngle!=0);
    // Make a nice curve (for testing with sin/cos here)
    // HINT: THE NEW IMPLEMENTATION ALWAYS USES A CURVED PATH!
    //       But when there is no curve angle (bend=0.0) an infinite circle radius 
    //       is assumed which will make the path nearly linear ;)


    // How large must be the circle's radius so that the arc segment (with the given angle)
    // has the desired path length (such as defined in the outer shape)?
    // U = 2*PI*r
    // r = U / (2*PI)
    // 
    // The actual segment size
    //var tmpCircleRadius = pathLength / (Math.PI*2); // 110
    
    // The length of the circle arc must be exactly the shape's length
    var tmpCircleRadius   = pathLength / ((pathBendAngle/180.0)*Math.PI);

    for( var i = 0; i < pathSegments; i++ ) {
	var t     = i/ (pathSegments);
	//var angle = Math.PI * t * 0.75;
	var angle = Math.PI * (pathBendAngle/180.0) * t;
	var sin   = Math.sin( angle );
	var cos   = Math.cos( angle );

	var pathPoint = new THREE.Vector3( cos * tmpCircleRadius,  // 110?
					   sin * tmpCircleRadius, // 110?
					   0 
					 );
	// translate to center
	pathPoint.add( new THREE.Vector3( -tmpCircleRadius,
					  -pathLength/2, 
					  0
					)
		     );
	pathPoints.push( pathPoint );

    }


    
    
    var extrusionPath = new THREE.Path( pathPoints );
    
    
    var extrusionGeometry = new IKRS.PathDirectedExtrudeGeometry( extrusionShape, 
								  extrusionPath,
								  shapedPath,
								  { size:                       pathLength,   // 300,
								    height:                     10,
								    curveSegments:              pathSegments, // 3,
								    triangulate:                triangulate,
								    hollow:                     build_negative_mesh,
								    closePathBegin:             mesh_close_path_begin,
								    closePathEnd:               mesh_close_path_end,
								    perpendicularHullStrength:  mesh_hull_strength,
								    closeShape:                 !split_shape,
								    meshOffset:                 mesh_offset
								  }
								);	
	
    

    /*
    var exrusionMaterial = new THREE.MeshLambertMaterial( 
	{ color: 0x2D303D, 
	  wireframe: wireFrame, // false, 
	  shading: THREE.FlatShading // THREE.LambertShading // THREE.FlatShading 
	} 
	);
	*/

    var exrusionMaterial = new THREE.MeshPhongMaterial( 
	{ color: 0x151D28, //0x2D303D, 
	  ambient: 0x996633, // 0xffffff, // 0x996633, // should generally match color
	  specular: 0x888888, // 0x050505,
	  shininess: 50, //100,
	  //emissive: 0x101010, // 0x000000, 
	  wireframe: wireFrame, 
	  shading: THREE.LambertShading // THREE.FlatShading 
	} 
	);

    // As many as there are extrusion steps
    var extrusionMaterialArray = [ exrusionMaterial,
				   exrusionMaterial
				 ];

    
    var new_mesh = new THREE.Mesh( extrusionGeometry,
				   new THREE.MeshFaceMaterial( extrusionMaterialArray )
				 );
    
    return new_mesh;
}
    

/**
 * This function creates the points for a circle shape (with the given segment count).
 **/
IKRS.PreviewCanvasHandler.prototype._createCircleShapePoints = function( circleSegmentCount,
									 circleRadius,
									 startAngle,
									 arc						    
								       ) {
    
    var shapePoints = [];

    // If the mesh is split, the shape will be split into two halfs. 
    // -> eventually divide the shape's segment count by two.
    //var localSegmentCount = ( split_shape ? circleSegmentCount/2 : circleSegmentCount );
    //for( i = 0; i <= localSegmentCount; i++ ) {
    for( i = 0; i <= circleSegmentCount; i++ ) {
	var pct = i * (1.0/circleSegmentCount);
	var angle = startAngle + arc * pct;
	//if( split_shape ) angle = Math.PI/2.0 + Math.PI * pct;
	//else              angle = Math.PI/2.0 + Math.PI * pct * 2.0;
	   
	    
	shapePoints.push( new THREE.Vector3( Math.sin( angle ) * circleRadius,
					     Math.cos( angle ) * circleRadius,
					     0
					   )
			);
    }
    
    return shapePoints;

}

IKRS.PreviewCanvasHandler.prototype._getViewSettings = function() {

    var previewSettings = {};

    if( this.preview_meshes.length > 0 ) {

	var mesh = this.preview_meshes[ 0 ];
	previewSettings.rotation = mesh.rotation.clone();
	previewSettings.scale    = mesh.scale.clone();

    } 

    return previewSettings;
}

IKRS.PreviewCanvasHandler.prototype._clearScene = function() {

    // Clear scene
    for( var i = 0; i < this.preview_meshes.length; i++ ) {	    
	this.preview_scene.remove( this.preview_meshes[i] );
    }
    this.preview_meshes = [];

}

IKRS.PreviewCanvasHandler.prototype.render = function() {
    this.preview_renderer.render( this.preview_scene, this.preview_camera ); 
}




// Render first time only if the DOM is fully loaded!
//window.onload = preview_render;
