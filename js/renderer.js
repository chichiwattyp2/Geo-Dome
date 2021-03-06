var DATAVERSE = DATAVERSE || {};

DATAVERSE.renderer = function(options, parent){

    var self = this;

    // Pointer to parent

    self.main = parent;

    self.options = options;


};


DATAVERSE.renderer.prototype = {

    'init_scenes': function(){

        var self = this;

        self.scene = document.querySelector("a-scene");

        self.camera = document.querySelector("a-camera");

        self.cursor = document.querySelector("a-cursor");

    },

    'render_intropanel': function(){

        var self = this;

        var already_visited_scene = self.main.state.state.actual_scene in self.main.state.state.visited_scenes;

        var render_intro = !(already_visited_scene ? true : (('autohide_intro' in self.actual_scene_data) ? (self.actual_scene_data.autohide_intro === "yes") : false));

        if(render_intro) {

            self.intro_panel = document.createElement("a-entity");

            self.intro_panel.classList.add("dataverse-added");

            self.intro_panel.setAttribute("intro-panel", {
                theme: self.theme,
                credits: self.actual_scene_data.credits ? self.actual_scene_data.credits : "",
                title: self.actual_scene_data.title,
                text: self.actual_scene_data.explain,
                yaw: self.counter_cam_rotation
            });

            self.scene.appendChild(self.intro_panel);

            self.intro_panel.addEventListener("closed", function(){
                 self.cursor.setAttribute("raycaster", {near: 0.0, objects: ".clickable"});

                 if(self.laser_controls) {

                     self.laser_controls.setAttribute("raycaster", {near: 0.0, objects: ".clickable"});
                 }

            });
        }
        else{
             self.cursor.setAttribute("raycaster", {near: 0.0, objects: ".clickable"});

             if(self.laser_controls) {

                 self.laser_controls.setAttribute("raycaster", {near: 0.0, objects: ".clickable"});
             }

        }

     },

    'set_cursor': function(){

        var self = this;


        console.log("HEADSET", AFRAME.utils.checkHeadsetConnected(), AFRAME.utils.isMobile(), AFRAME.utils.isGearVR(), navigator.userAgent);

        var mobile = AFRAME.utils.isMobile();
        var headset = AFRAME.utils.checkHeadsetConnected();

        var desktop = !(mobile) && !(headset);

        self.cursor.parentNode.removeChild(self.cursor);

        self.cursor = document.createElement("a-entity");

        self.camera.appendChild(self.cursor);

        self.cursor.setAttribute("id", "cursor");

        self.cursor.setAttribute("cursor", {rayOrigin: desktop ? "mouse": "entity", fuse: true, fuseTimeout: DATAVERSE.animation.button});
        self.cursor.setAttribute("position", {x:0,y:0,z:-1});
        self.cursor.setAttribute("geometry", {primitive: "ring", radiusInner: 0.01, radiusOuter: 0.02});
        self.cursor.setAttribute("material", {color: self.theme_data.cursor_color, shader: "flat"});
        self.cursor.setAttribute("visible", !desktop);

        // Oculus Go or GearVR;

        if(AFRAME.utils.isMobile() && AFRAME.utils.isGearVR()){
            headset = true;
            mobile = false;
        }

        // To avoid clicks while loading and intro panel is present

        self.cursor.setAttribute("raycaster", {near: 0.0, objects: ".non_click_while_loading"});

        if((headset) && (!(mobile))){

            console.log("INSERTING LASER CONTROLS");

            self.laser_controls = document.createElement("a-entity");

            self.laser_controls.setAttribute("laser-controls", {});

            self.laser_controls.classList.add("dataverse-added");

            self.laser_controls.setAttribute("line", {color: self.theme_data.cursor_color});

            self.laser_controls.setAttribute("raycaster", {near: 0.0, objects: ".non_click_while_loading"});

            // Hide and deactivate gaze cursor

            self.cursor.setAttribute("visible", false);

            self.cursor.setAttribute("raycaster", {far:0.0});

            self.scene.appendChild(self.laser_controls);

        }


        DATAVERSE.cursor_mode = desktop ? "desktop" : (mobile ? "gaze": "laser");

    },

    // Renders auxiliary elements: lights, themes, floor, audio, etc..

    'render_aux_assets': function(){

        var self = this;

        // TODO: THEMES module here

        self.ambient_light = document.createElement("a-entity");
        self.ambient_light.setAttribute("light", {type:"ambient", color: "#AAA"});
        self.ambient_light.classList.add("dataverse-added");

        self.directional_light = document.createElement("a-entity");
        self.directional_light.setAttribute("light", {type:"directional", color: "#EEE", intensity: 0.5});
        self.directional_light.setAttribute("position", {x:1, y:10, z:-1});
        self.directional_light.classList.add("dataverse-added");



        self.set_cursor();

        self.scene.appendChild(self.directional_light);
        self.scene.appendChild(self.ambient_light);

    },

    'render_menu': function(media_id){

        var self = this;

        // Add menu

        self.menu = document.createElement("a-entity");
        self.menu.classList.add("dataverse-added");

        var icons = self.main.state.state.scene_history.length === 0 ? {'icons': ["home.png"], 'names': ["home"]}: {'icons': ["arrow-left.png","home.png"], 'names': ["back","home"]};


        if(media_id) {

            self.menu.setAttribute("uipack-menu", {

                theme: self.theme,

                icons: icons.icons, buttons: [], media_id: media_id, open: true

            });

        }
        else {

            self.menu.setAttribute("uipack-menu", {

                theme: self.theme,

                icons: icons.icons,  buttons: [], open:true

            });

        }

        self.scene.appendChild(self.menu);


        // Events...

        self.menu.addEventListener("clicked", function(e){

            // Home

            if(e.detail.type === "icon" && icons.names[e.detail.index] === "home"){

                // Push scene in history, and point to home scene

                self.main.state.state.scene_history.push(self.main.state.state.actual_scene);

                var obj = { Title: "", Url: window.location.origin + window.location.pathname + "?scene=" + self.main.state.state.actual_scene};
                history.pushState(obj, obj.Title, obj.Url);


                self.main.state.state.actual_scene = self.main.state.state.home_scene;

                self.render_scene();

            }


            if(e.detail.type === "icon" && icons.names[e.detail.index] === "back"){

                if(self.main.state.state.scene_history.length > 0) {

                    var back_scene = self.main.state.state.scene_history.pop();

                    self.main.state.state.actual_scene = back_scene;

                    self.render_scene();
                }


            }

        });

    },

    'follow_link': function(destination){

        var self = this;

        // Push scene in history and change actual scene to destination

        self.main.state.state.scene_history.push(self.main.state.state.actual_scene);

        var obj = { Title: "", Url: window.location.origin + window.location.pathname + "?scene=" + self.main.state.state.actual_scene};
        history.pushState(obj, obj.Title, obj.Url);

        self.main.state.state.actual_scene = destination;

        self.render_scene();

    },

    'insert_loading_scene': function(){

        var self = this;

        var img_asset = document.createElement("img");

        img_asset.setAttribute("id", "loading_scene");
        img_asset.setAttribute('crossorigin', 'anonymous');
        img_asset.setAttribute("src", DATAVERSE.paths.loading_thumbnail_static);

        self.assets.appendChild(img_asset);

        // Insert loading symbols

        var loading_defs = [
            [ [0, 1.6, -4], [-4, 1.6, 0], [4, 1.6, 0], [0, 1.6, 4]],
            [ [0, 0, 0], [0, 90, 0], [0, -90, 0], [0, -180, 0]]
        ];

        for(var i=0; i< loading_defs[0].length; i++){

            // Race condition here with removal on dv_loaded

            if(!(self.loaded_scene)) {

                var loading = document.createElement("a-plane");

                loading.classList.add("dataverse-added", "loading_scene");
                loading.setAttribute("position", {x: loading_defs[0][i][0], y: loading_defs[0][i][1], z: loading_defs[0][i][2]});
                loading.setAttribute("rotation", {x: loading_defs[1][i][0], y: loading_defs[1][i][1], z: loading_defs[1][i][2]});
                loading.setAttribute("width", 1);
                loading.setAttribute("height", 1);
                loading.setAttribute("src", DATAVERSE.paths.loading_thumbnail_static);

                document.querySelector("a-scene").appendChild(loading);

                var text = document.createElement("a-text");

                text.classList.add("dataverse-added", "loading_scene");
                text.setAttribute("position", {x: loading_defs[0][i][0], y: loading_defs[0][i][1] - 0.75, z: loading_defs[0][i][2]});
                text.setAttribute("rotation", {x: loading_defs[1][i][0], y: loading_defs[1][i][1], z: loading_defs[1][i][2]});
                text.setAttribute("width", 5);
                text.setAttribute("font", "exo2bold");
                text.setAttribute("anchor", "center");
                text.setAttribute("align", "center");
                text.setAttribute("value", "Loading scene");

                document.querySelector("a-scene").appendChild(text);
            }

        }


    },

    // Renders a scene

    'render_scene': function(){

        var self = this;

        self.loaded_scene = false;

        self.counter_cam_rotation = (self.scene.camera.el.getAttribute("rotation").y);

        self.counter_cam_position = (self.scene.camera.el.getAttribute("position"));

        var to_delete = [];

        for(var i=0; i < self.scene.children.length; i++){

            var child = self.scene.children[i];

            if(child.classList.contains("dataverse-added"))
                    to_delete.push(child);
        }

        to_delete.forEach(function(child){
            self.scene.removeChild(child);
        });

        self.assets = document.createElement("a-assets");
        self.assets.classList.add("dataverse-added");

        self.scene.appendChild(self.assets);

        // Insert scene component

        self.actual_scene_data = self.main.state.state.scenes[self.main.state.state.actual_scene];

        // Check that component is registered, else.. croack

        if((self.actual_scene_data === undefined) || (!(self.actual_scene_data.type in AFRAME.components))){

            self.main.croak("Invalid type of scene in row or nonexistent scene: " + (self.main.state.state.actual_scene));

        }
        else {

            self.theme = (self.actual_scene_data.theme !== "") ? self.theme = self.actual_scene_data.theme : DATAVERSE.constants.default_theme;

            self.theme_data = DATAVERSE.themes[self.theme];

            DATAVERSE.scene_number = self.main.state.state.actual_scene;

            // Redefine icon path

            DATAVERSE.UIPACK_CONSTANTS.icon_path = self.theme_data.icon_path;

            self.render_aux_assets();
            self.actual_scene_component = document.createElement("a-entity");
            self.actual_scene_component.classList.add("dataverse-added");
            self.actual_scene_component.setAttribute("visible", false);

            var my_params = AFRAME.utils.styleParser.parse(self.actual_scene_data.params);

            my_params.title = self.actual_scene_data.title;
            my_params.explain = self.actual_scene_data.explain;
            my_params.source = self.main.state.state.scenes_data_source;

            if ((self.actual_scene_data.type === "photo-viz") || (self.actual_scene_data.type === "video-viz")){
                my_params.tab = "labels";
            }
            else {
                my_params.tab = self.actual_scene_data.tab;
            }

            // If theme exists, fill it in params

            my_params.theme = self.theme;

            if(self.actual_scene_data.media_source){

                my_params.media_source = self.actual_scene_data.media_source;
            }

            if(self.actual_scene_data.subtype){

                my_params.type = self.actual_scene_data.subtype;
            }


            // Set floor: its an image

            if(self.actual_scene_data.floor.indexOf('.')!==-1){

                self.floor = document.createElement("a-plane");
                self.floor.setAttribute("src", self.actual_scene_data.floor);
                self.floor.setAttribute("width", 100);
                self.floor.setAttribute("height", 100);
                self.floor.setAttribute("repeat", "100 100");

                self.floor.setAttribute("rotation", {x:-90, y: self.counter_cam_rotation, z:0});

                self.floor.classList.add("dataverse-added");

                self.floor.setAttribute("visible", false);

                self.scene.appendChild(self.floor);


            }
            else {

                if(self.actual_scene_data.floor) {

                    self.floor = document.createElement("a-plane");
                    self.floor.setAttribute("color", self.actual_scene_data.floor);
                    self.floor.setAttribute("width", 100);
                    self.floor.setAttribute("height", 100);
                    self.floor.setAttribute("repeat", "100 100");
                    self.floor.setAttribute("rotation", {x:-90, y: self.counter_cam_rotation, z:0});
                    self.floor.classList.add("dataverse-added");

                    self.floor.setAttribute("visible", false);

                    self.scene.appendChild(self.floor);

                }

                // If no specific floor, see if viz is on list of vizs with themed floor

                else {

                    if(DATAVERSE.floor_vizs.indexOf(self.actual_scene_data.type.toLowerCase())!== -1){

                        var my_floor = self.theme_data.floor;

                        if(my_floor.indexOf(".") !== -1) {

                            self.floor = document.createElement("a-plane");
                            self.floor.setAttribute("src", my_floor);
                            self.floor.setAttribute("width", 100);
                            self.floor.setAttribute("height", 100);
                            self.floor.setAttribute("repeat", "100 100");

                            self.floor.setAttribute("rotation", {x: -90, y: self.counter_cam_rotation, z: 0});

                            self.floor.classList.add("dataverse-added");

                            self.floor.setAttribute("visible", false);

                            self.scene.appendChild(self.floor);
                        }
                        else {

                            self.floor = document.createElement("a-plane");
                            self.floor.setAttribute("color", my_floor);
                            self.floor.setAttribute("width", 100);
                            self.floor.setAttribute("height", 100);
                            self.floor.setAttribute("repeat", "100 100");
                            self.floor.setAttribute("rotation", {x: -90, y: self.counter_cam_rotation, z: 0});
                            self.floor.classList.add("dataverse-added");

                            self.floor.setAttribute("visible", false);

                            self.scene.appendChild(self.floor);
                        }


                    }

                }
            }


           // Set sky

           // color ?

            // Assume an image if background contains a dot

            if(self.actual_scene_data.background.indexOf('.')!==-1){

                self.sky = document.createElement("a-sky");
                self.sky.setAttribute("src", self.actual_scene_data.background);
                self.sky.classList.add("dataverse-added");

                self.sky.setAttribute("rotation", {x:0, y: self.counter_cam_rotation, z:0});


                self.sky.setAttribute("visible", false);


                self.scene.appendChild(self.sky);


            }
            else {

                if(self.actual_scene_data.background) {

                    self.sky = document.createElement("a-sky");
                    self.sky.setAttribute("color", self.actual_scene_data.background);
                    self.sky.classList.add("dataverse-added");

                    self.sky.setAttribute("rotation", {x:0, y: self.counter_cam_rotation, z:0});

                    self.sky.setAttribute("visible", false);

                    self.scene.appendChild(self.sky);
                }
                else {

                    if(DATAVERSE.sky_vizs.indexOf(self.actual_scene_data.type.toLowerCase())!== -1){

                        var my_sky = self.theme_data.sky;

                        if(my_sky.indexOf(".") !== -1) {

                            self.sky = document.createElement("a-sky");
                            self.sky.setAttribute("src", my_sky);
                            self.sky.classList.add("dataverse-added");

                            self.sky.setAttribute("rotation", {x:0, y: self.counter_cam_rotation, z:0});

                            self.sky.setAttribute("visible", false);

                            self.scene.appendChild(self.sky);

                        }
                        else {

                            self.sky = document.createElement("a-sky");
                            self.sky.setAttribute("color", my_sky);
                            self.sky.classList.add("dataverse-added");

                            self.sky.setAttribute("rotation", {x:0, y: self.counter_cam_rotation, z:0});

                            self.sky.setAttribute("visible", false);

                            self.scene.appendChild(self.sky);


                        }

                    }
                }
            }

            // Set position and rotation from params, and delete from entity-specific params

            if("position" in my_params){
                self.actual_scene_component.setAttribute("position", {x: self.counter_cam_position.x + my_params.position.split(" ")[0], y: self.actual_scene_component.getAttribute("position").y, z: self.counter_cam_position.z + + my_params.position.split(" ")[2]});
                delete(my_params.position);
            }
            else {
                self.actual_scene_component.setAttribute("position", {x: self.counter_cam_position.x, y: self.actual_scene_component.getAttribute("position").y, z: self.counter_cam_position.z});
            }


            // Set rotation if specified and/or correct for user head yaw landing (based on camera)

            if("rotation" in my_params){
                self.actual_scene_component.setAttribute("rotation", {x: my_params.rotation.split(" ")[0], y:(parseFloat(my_params.rotation.split(" ")[1]) + self.counter_cam_rotation) % 360, z: my_params.rotation.split(" ")[2]}) ;
                delete(my_params.rotation);
            }
            else {
                self.actual_scene_component.setAttribute("rotation", {x: 0, y: (self.counter_cam_rotation % 360), z: 0}) ;
            }

            self.actual_scene_component.setAttribute(self.actual_scene_data.type, my_params);

            self.scene.appendChild(self.actual_scene_component);

            // Now launch menu: directly if no audio/video

            if(self.actual_scene_data.type === "video-viz"){

                // wait until video asset id is inserted, and then launch

                self.actual_scene_component.addEventListener("asset_added", function(e){

                        // Render menu with video_id

                        self.render_menu(e.detail.id);

                });


            }
            else {

                // Only launch audio if exists and it's not a video-viz

                if((self.actual_scene_data.audio.length > 2) && !(self.actual_scene_data.type === "video-viz")) {

                    self.audio = document.createElement("audio");
                    self.audio.classList.add("dataverse-added");

                    self.audio.setAttribute('crossorigin', 'anonymous');


                    self.audio.setAttribute("src", self.actual_scene_data.audio);
                    self.audio.setAttribute("id", "audio");
                    self.audio.setAttribute("autoplay", true);
                    self.audio.setAttribute("crossorigin", "anonymous");


                    self.assets.appendChild(self.audio);

                    self.render_menu("audio");
                }
                else {
                    // directly add menu

                    // Render menu

                    self.render_menu();

                }

            }

            // Set scene

            self.main.urls.set_params({scene: self.main.state.state.actual_scene, source: self.main.state.state.scenes_data_source});


            // Loading effect: Back sphere and 'loading scene' texts


            self.back_sphere = document.createElement("a-sphere");

            self.back_sphere.setAttribute("material", {shader: "flat", side: "back", color: "black"});

            self.back_sphere.setAttribute("radius", 5.0);

            self.back_sphere.setAttribute("opacity", 1.0);

            self.back_sphere.classList.add("dataverse-added");

            self.back_sphere.setAttribute("position", self.counter_cam_position);

            self.scene.appendChild(self.back_sphere);

            self.insert_loading_scene();

            // React on 'link'

            self.actual_scene_component.addEventListener("link", function(evt){

                self.follow_link(evt.detail.link);
            });

            self.actual_scene_component.addEventListener("dv_loaded", function(evt){

                self.loaded_scene = true;

                // Set component visibility

                self.actual_scene_component.setAttribute("visible", true);

                // Set sky visibility

                if(self.sky){
                    self.sky.setAttribute("visible", true);
                }

                if(self.floor){
                    self.floor.setAttribute("visible", true);
                }


                var myNodeList = document.querySelectorAll('.skyspheres');

                [].forEach.call(myNodeList, function (item) {

                    item.setAttribute("visible", true);
                });

                // Remove 'loading scene'

                var els = self.scene.querySelectorAll('.loading_scene');

                for (var i = 0; i < els.length; i++) {

                    els[i].parentNode.removeChild(els[i]);
                }

                self.render_intropanel();

                self.main.state.state.visited_scenes[self.main.state.state.actual_scene] = true;


                if(self.back_sphere.hasLoaded) {

                    var sphere_animation = document.createElement("a-animation");

                    sphere_animation.setAttribute("attribute", "opacity");
                    sphere_animation.setAttribute("dur", 2000);
                    sphere_animation.setAttribute("from", 1.0);
                    sphere_animation.setAttribute("to", 0.0);

                    self.back_sphere.appendChild(sphere_animation);

                    sphere_animation.addEventListener("animationend", function () {

                         self.back_sphere.parentNode.removeChild(self.back_sphere);

                    });

                }
                else {

                    self.back_sphere.addEventListener("loaded", function(){
                        var sphere_animation = document.createElement("a-animation");

                        sphere_animation.setAttribute("attribute", "opacity");
                        sphere_animation.setAttribute("dur", 2000);
                        sphere_animation.setAttribute("from", 1.0);
                        sphere_animation.setAttribute("to", 0.0);

                        self.back_sphere.appendChild(sphere_animation);

                        sphere_animation.addEventListener("animationend", function () {

                                self.back_sphere.parentNode.removeChild(self.back_sphere);
                        });

                    });
                }


            });
        }

     }

};