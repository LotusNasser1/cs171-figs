// Minimal Simplemaps config tailored for CSV-driven coloring
// We set auto_load: "no" so we can compute colors from your CSV first.
// Then main.js will call simplemaps_usmap.load() / refresh().
var simplemaps_usmap_mapdata = {
    main_settings: {
    // General
    width: "responsive",
    background_color: "#FFFFFF",
    background_transparent: "yes",
    popups: "detect",
    
    
    // State defaults
    state_description: "",
    state_color: "#d9e3ef",
    state_hover_color: "#4575b4",
    state_url: "",
    border_size: 1.5,
    border_color: "#ffffff",
    all_states_inactive: "no",
    all_states_zoomable: "no",
    
    
    // Labels
    label_color: "#ffffff",
    label_hover_color: "#ffffff",
    label_size: 22,
    label_font: "Arial",
    hide_labels: "no",
    
    
    // Zoom
    manual_zoom: "yes",
    navigation_size: "40",
    navigation_color: "#f7f7f7",
    navigation_border_color: "#636363",
    initial_back: "no",
    initial_zoom: -1,
    initial_zoom_solo: "no",
    region_opacity: 1,
    region_hover_opacity: 0.7,
    
    
    // Popup
    popup_color: "white",
    popup_opacity: 0.95,
    popup_shadow: 1,
    popup_corners: 5,
    popup_font: "12px/1.5 Verdana, Arial, Helvetica, sans-serif",
    
    
    // Advanced
    div: "map",
    auto_load: "no",
    url_new_tab: "yes",
    images_directory: "default",
    import_labels: "no",
    fade_time: 0.1,
    link_text: "View"
    },
    state_specific: {},
    locations: {},
    labels: {}
    };