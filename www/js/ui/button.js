/**
 * Created by Oscar on 14/08/16.
 */


AFRAME.registerComponent('uipack-button', {
    schema: {
        icon_name: {type: 'string'},
        yaw: { type: 'number', default: 0.0},
        elevation: { type: 'number', default: UIPACK_CONSTANTS.button_elevation},
        distance: { type: 'number', default: UIPACK_CONSTANTS.button_distance},
        absolute_pos: { type: 'boolean', default: false},
        radius: {type: 'number', default: UIPACK_CONSTANTS.button_radius}
    },

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {

    var self = this;

    // Create the element

    self.button = document.createElement("a-circle");

    this.el.appendChild(self.button);

    // Hover flag and events...

    self.first_hover = true;

    this.el.addEventListener('raycaster-intersected', function(event){

        // First 'fresh' hover

        if(self.first_hover) {

            // Insert ring for animation on hover

            self.ring = document.createElement("a-ring");
            self.ring.setAttribute("radius-inner", self.data.radius * 1.1);
            self.ring.setAttribute("radius-outer", self.data.radius * 1.2);
            self.ring.setAttribute("material", "color:" + UIPACK_CONSTANTS.arc_color);
            self.ring.setAttribute("visible", true);

            // Create animation

            self.animation = document.createElement("a-animation");
            self.animation.setAttribute("easing", "linear");
            self.animation.setAttribute("attribute", "geometry.thetaLength");
            self.animation.setAttribute("dur", 1500);
            self.animation.setAttribute("from", "0");
            self.animation.setAttribute("to", "360");

            self.ring.appendChild(self.animation);

            self.el.appendChild(self.ring);

            self.first_hover = false;

            // Change cursor color and scale

//            self.original_cursor_color = event.detail.el.getAttribute("material").color;
//
//
//            event.detail.el.setAttribute("material", "color:white");

            event.detail.el.setAttribute("scale", "2 2 2");

            // Emit 'clicked' on ring animation end

            self.animation.addEventListener("animationend", function () {

                self.ring.parentNode.removeChild(self.ring);

                event.detail.el.setAttribute("visible", "false");

                self.el.emit("clicked", null, false);

            });
        }
    });

    this.el.addEventListener('raycaster-intersected-cleared', function(event){

         self.first_hover = true;

         // Change cursor color and scale

//         event.detail.el.setAttribute("material", "color:red");
         event.detail.el.setAttribute("scale", "1 1 1");
         event.detail.el.setAttribute("visible", "true");

        // Remove ring if existing

         if(self.ring.parentNode) {

             self.ring.parentNode.removeChild(self.ring);
         }

    });

  },
//
//  /**
//   * Called when component is attached and when component data changes.
//   * Generally modifies the entity based on the data.
//   */
  update: function (oldData) {

    var self = this;

    // CHange material, radius, position and rotation

    self.icon_path = UIPACK_CONSTANTS.icon_path + "/" + self.data.icon_name;

    self.button.setAttribute("material",{"src": 'url(' + self.icon_path + ')'});

    self.button.setAttribute("radius", self.data.radius);

        // If parent is scene, absolute positioning, else, leave position up to the user

        if(self.el.parentEl === self.el.sceneEl || self.data.absolute_pos) {


            self.x_position = self.data.distance * Math.cos(this.data.yaw * Math.PI/180.0);
            self.y_position = self.data.elevation;
            self.z_position = -self.data.distance * Math.sin(this.data.yaw * Math.PI/180.0);

            this.el.setAttribute("rotation", {x: 0, y: this.data.yaw - 90, z: 0});

            this.el.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));

        }

  },
//
//  /**
//   * Called when a component is removed (e.g., via removeAttribute).
//   * Generally undoes all modifications to the entity.
//   */
//  remove: function () { },
//
//  /**
//   * Called on each scene tick.
//   */
  tick: function (t) {

  },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () { },

  /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
  play: function () { }
});
