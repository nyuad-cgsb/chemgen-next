"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var php = require("js-php-serialize");
var WpPosts = app.models['WpPosts'];
/**
 * This is very theme dependent and should probably be in a configuration somewhere
 * For now we are using the 'shapely' theme
 * https://colorlib.com/wp/themes/shapely/
 * These sizes need to be generated by imageMagick
 * And are generated during the processImagePipeline
 * @param imageBase
 * @returns {any}
 */
WpPosts.helpers.genImageMeta = function (imageBase) {
    // var imageSizes = ['150x150', '300x300', '768x768', '1024x1024', '1024x1024', '1110x530', '730x350', '350x300'];
    // TODO In WP all image are prefaced with 'assays', but this should really be a configuration
    var imageSplit = imageBase.split('/');
    var imageName = imageSplit.pop();
    var imageMetaObj = {
        width: 1600,
        height: 1600,
        file: 'assays/' + imageBase + '.jpeg',
        sizes: {
            thumbnail: {
                file: imageName + '-150x150.jpeg',
                width: 150,
                height: 150,
                'mime-type': 'image/jpeg',
            },
            medium: {
                file: imageName + '-300x300.jpeg',
                width: 300,
                height: 300,
                'mime-type': 'image/jpeg',
            },
            medium_large: {
                file: imageName + '-600x600.jpeg',
                width: 600,
                height: 600,
                'mime-type': 'image/jpeg',
            },
            large: {
                file: imageName + '-1024x1024.jpeg',
                width: 1024,
                height: 1024,
                'mime-type': 'image/jpeg',
            },
            'original': {
                file: imageName + '.jpeg',
                width: 1600,
                height: 1600,
                'mime-type': 'image/jpeg',
            },
            'shapely-full': {
                file: imageName + '-768-768.jpeg',
                width: 768,
                height: 768,
                'mime-type': 'image/jpeg',
            },
            'shapely-featured': {
                file: imageName + '-768x768.jpeg',
                width: 768,
                height: 768,
                'mime-type': 'image/jpeg',
            },
            'shapely-grid': {
                file: imageName + '-300x300.jpeg',
                width: 300,
                height: 300,
                'mime-type': 'image/jpeg',
            },
        },
        image_meta: {
            aperture: '0',
            credit: '',
            camera: '',
            caption: '',
            created_timestamp: '0',
            copyright: '',
            focal_length: '0',
            iso: '0',
            shutter_speed: '0',
            title: '',
            orientation: '0',
            keywords: {},
        },
    };
    return php.serialize(imageMetaObj);
};
//# sourceMappingURL=WpPosts.js.map