'use strict';

var production_cfg = require('./production');

module.exports = {
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
                'public/lib/angular-xeditable/dist/css/xeditable.css',
                'public/lib/angular-ui-select/dist/select.css',
                'public/lib/font-awesome/css/font-awesome.min.css',
                'public/lib/animate.css/animate.min.css',
                'public/lib/jqcloud2/dist/jqcloud.min.css',
                'public/lib/FlexSlider/flexslider.css'
            ],
            js: [
                'public/lib/lodash/lodash.min.js',
                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/bootstrap/dist/js/bootstrap.min.js',
                'public/lib/FlexSlider/jquery.flexslider-min.js',
                'public/lib/angular/angular.min.js',
                'public/lib/angular-resource/angular-resource.min.js',
                'public/lib/angular-cookies/angular-cookies.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-touch/angular-touch.min.js',
                'public/lib/angular-sanitize/angular-sanitize.min.js',
                'public/lib/angular-translate/angular-translate.min.js',
                'public/lib/angular-filter/dist/angular-filter.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-ui-select/dist/select.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'public/lib/angular-permission/dist/angular-permission.js',
                'public/lib/tv4/tv4.js',
                'public/lib/objectpath/lib/ObjectPath.js',
                'public/lib/angular-schema-form/dist/schema-form.min.js',
                'public/lib/angular-schema-form/dist/bootstrap-decorator.min.js',
                'public/lib/angular-xeditable/dist/js/xeditable.min.js',
                'public/lib/angular-encode-uri/dist/angular-encode-uri.min.js',
                'public/lib/angular-schema-form-ui-select/angular-underscore.min.js',
                'public/lib-var/bootstrap-ui-select.min.js',
                'public/lib/angular-schema-form-ui-select/ui-sortable.min.js',
                'public/lib/ng-file-upload/ng-file-upload-shim.min.js',
                'public/lib/ng-file-upload/ng-file-upload.min.js',
                'public/lib/angular-flexslider/angular-flexslider.js',
                'public/lib/angular-scroll/angular-scroll.min.js',
                'public/lib/waypoints/waypoints.min.js',
                'public/lib/angulartics/dist/angulartics.min.js',
                'public/lib/angulartics/dist/angulartics-ga.min.js',
                'public/lib/angulartics/dist/angulartics-scroll.min.js',
                'public/lib/angular-jqcloud/angular-jqcloud.js',
                'public/lib/jqcloud2/dist/jqcloud.min.js'
            ]
        },
        css: [
            'public/modules/**/css/*.css'
        ],
        js: [
            'public/config.js',
            'public/application.js',
            'public/read_key.js',
            'public/modules/*/*.js',
            'public/modules/*/*[!tests]*/*.js'
        ]
    },
    public_key: production_cfg.public_key
};
