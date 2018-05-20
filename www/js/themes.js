DATAVERSE.themes =
{
    'dark': {
        'color_scale': 'category20b',
        'default_color': '#CCCCCC',
        'cursor_color': '#F91100',
        'arc_color': '#F91100',
        'floor': '#313037',
        'sky': '#808290',
        'icon_path': 'themes/dark/icons',
        'text_color': '#E5E8F2',
        'text_background': '#313037',
//https://aframe.io/docs/0.8.0/components/text.html
        'text_font': 'exo2bold',
        'map_provider': 'CartoDB.DarkMatter',
        'earth_texture': 'themes/dark/textures/8081-earthmap10k.jpg',
        'timeline_color': '#313037',
        'panel_color': "#313037",
        'panel_aux_color': "#313037",
        'panel_font': "roboto",
        'panel_title_font': "exo2bold",
        'panel_background': "#FFFFFF",
        'panel_backpanel': "#E5E8F2",
        'player_background': "white",
        'player_text_color': "black",
        'player_font': '30px Roboto',
        'loading_gif': 'themes/dark/textures/loading.gif'
    },
    'light': {
        'color_scale': 'category10',
        'default_color': '#333333',
        'cursor_color': '#F91100',
        'arc_color': '#F91100',
        'floor': '#B1B0B9',
        'sky': '#E5E8F2',
        'icon_path': 'themes/light/icons',
        'text_color': '#313037',
        'text_background': '#E5E8F2',
        'text_font': 'roboto',
        'map_provider': 'CartoDB.Positron',
        'earth_texture': 'themes/light/textures/8081-earthmap10k.jpg',
        'timeline_color': '#BFF',
        'panel_color': "#E5E8F2",
        'panel_aux_color': "#E5E8F2",
        'panel_font': "roboto",
        'panel_title_font': "exo2bold",
        'panel_background': "#000000",
        'panel_backpanel': "#313037",
        'player_background': "#000000",
        'player_text_color': "white",
        'player_font': '30px Roboto',
        'loading_gif': 'themes/light/textures/loading.gif'
    }
};


DATAVERSE.floor_vizs = ['isotypes-radial-viz', 'timeline-viz'];

DATAVERSE.sky_vizs = ['isotypes-radial-viz', 'timeline-viz', 'photogrid-viz', 'small-treemap-viz', 'tilemap-viz'];
