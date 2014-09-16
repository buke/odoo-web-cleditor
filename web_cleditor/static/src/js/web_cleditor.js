/*---------------------------------------------------------
 * Full jquery cleditor
 * Copyright 2014 wangbuke <wangbuke@gmail.com>
 *---------------------------------------------------------*/

openerp.web_cleditor = function(instance) {
    var _t = instance.web._t,
    _lt = instance.web._lt;

    function createDlg(imagesListUrl, uploadUrl, data) {
        var editor = data.editor;
        var popup = data.popup;       
        var hiddenFrameName = _.uniqueId('oe_fileupload_temp');

        $(window).on(hiddenFrameName, function(e, result){
            var uploadIframe = $('#' + hiddenFrameName);
            uploadIframe.data('id', result.id);
            uploadIframe.data('filename', result.filename);
        });

        var dlgBody = '<div class="tabbable">'+		
        '<ul class="nav nav-tabs">'+
        ' <li class="active"><a id="tab1_click" href="#tab1" data-toggle="tab">' + _t('Upload image')+ '</a></li>'+
        ' <li><a id="tab2_click" href="#tab2" data-toggle="tab">' + _t('Images list')+ '</a></li>'+		
        '</ul>'+

        '<div class="tab-content">'+		
        // Image upload panel
        ' <div class="tab-pane active span7" id="tab1">'+
        '<iframe style="width:0;height:0;border:0;" id="' + hiddenFrameName + '" name="' + hiddenFrameName + '" />' +
        '<table cellpadding="5" cellspacing="0">' +
        '<tr><td>' + _t('Choose a File:')+ '</td></tr>' +
        '<tr><td> ' +
        '<form id="imgUploadForm" method="post" enctype="multipart/form-data" action="" target="' + hiddenFrameName + '">' +
        '<input id="ufile" name="ufile" type="file" accept="image/*"/>' +
        '<input type="hidden" name="session_id" value="' + instance.session.session_id + '" />' +
        '<input type="hidden" name="model" value="' + "ir.ui.menu" + '" />' +
        '<input type="hidden" name="id" value="' + 0 + '" />' +
        '<input type="hidden" name="callback" value="' + hiddenFrameName + '" />' +
        '</form> </td></tr>' +
        '<tr><td>' + _t('Or enter URL:')+ ' </td></tr>' +
        '<tr><td><input type="text" size="40" value="" /></td></tr>' +
        '</table><input type="button" id="uploadBtn" value="' + _t('Submit')+ '">'+		
        '</div>';

         dlgBody += '<div class="tab-pane active span7" id="tab2">'+
        '<div id="tb_imglist" style="width:300px;"></div>' + 
        '</div>' + 
        '</div>' + 
        '</div>';
        $(popup).html(dlgBody);

        // Insert image
        $(data.popup).find('.btn').unbind("click").bind("click", function(e) {
            e.preventDefault();
            // Insert some image into the document
            editor.execCommand(data.command, $(this).children("img").attr("src"), null, data.button);
            hidePopup(editor);
        });

        urlTextField = $(data.popup).find(':text'),
        uploadIframe = $('#' + hiddenFrameName);
        loadedFile = $(data.popup).find(':file');

        // Cleaning of previously selected file and url
        loadedFile.val('');
        urlTextField.val('').focus();

        // Submit button click event		
        $(data.popup).find(':button').unbind("click").bind("click", function(e) {
            // User downloads the file
            url = $.trim(urlTextField.val());
            if(loadedFile.val()) { 
                uploadIframe.bind('load', function() {
                    var fileUrl = '';
                    try {
                        var file_id = uploadIframe.data('id');
                        fileUrl = '/web/binary/image?model=ir.attachment&field=datas&id=' + file_id;
                    } catch(e) {
                        console.log('Error: ' + e);
                    }                        
                    if(fileUrl) {
                        editor.execCommand(data.command, fileUrl, null, data.button);
                    } else {
                        alert('An error occured during upload!');
                    }
                    uploadIframe.unbind('load');
                    hidePopup(editor);
                });
                $(data.popup).find('form').attr('action', uploadUrl);
                $(data.popup).find('form').submit();
            // User puts URL
            } else if (url != '') {
                urlTextField.focus();
                editor.execCommand(data.command, url, null, data.button);
                hidePopup(editor);
            }
        });

        $(popup).find('a#tab2_click').click(function(){
            instance.session.rpc(imagesListUrl, {}).then(function (jsonData){
                var dlgBody = '<ul style="margin:0;padding:0;list-style-type:none; max-height: 200px;overflow: scroll;">';
                for ( var i = 0; i < jsonData.length; i++) {			
                    dlgBody += '<li style="float:left;margin:0;padding:2px;">'+
                    '<a href="#" id="imgBtn'+i+'" class="btn thumbnail" style="margin:0;padding:0;">'+					
                    '<img src="'+jsonData[i]+'" width="64"/>'+
                    '</a></li>';	    
                }
                dlgBody += '</ul>';

                $(popup).find('#tb_imglist').html(dlgBody);
                $(data.popup).find('.btn').unbind("click").bind("click", function(e) {
                    e.preventDefault();
                    // Insert some image into the document
                    editor.execCommand(data.command, $(this).children("img").attr("src"), null, data.button);
                    hidePopup(editor);
                });
            });

        });

    }		       
   
    function hidePopup(editor) {
        editor.hidePopups();
        editor.focus();		
    }

    instance.web.form.FieldTextHtml = instance.web.form.FieldTextHtml.extend({
        initialize_content: function() {
            var self = this;

            if (! this.get("effective_readonly")) {
                self._updating_editor = false;
                self.add_image_button();

                this.$textarea = this.$el.find('textarea');
                var width = ((this.node.attrs || {}).editor_width || 'auto');
                var height = ((this.node.attrs || {}).editor_height || 250);
                var controls = ((this.node.attrs || {}).editor_controls || 'bold italic underline strikethrough subscript superscript | font size style | color highlight removeformat | bullets numbering | outdent indent | alignleft center alignright justify | undo redo | rule image link unlink | cut copy paste pastetext | print source');

                this.$textarea.cleditor({
                    width:      width, // width not including margins, borders or padding
                    height:     height, // height not including margins, borders or padding
                    controls:   controls,// controls to add to the toolbar
                    bodyStyle:  // style to assign to document body contained within the editor
                                "margin:4px; color:#4c4c4c; font-size:13px; font-family:'Lucida Grande',Helvetica,Verdana,Arial,sans-serif; cursor:text"
                });

                this.$cleditor = this.$textarea.cleditor()[0];
                this.$cleditor.change(function() {
                    if (! self._updating_editor) {
                        self.$cleditor.updateTextArea();
                        self.internal_set_value(self.$textarea.val());
                    }
                });

                if (this.field.translate) {
                    var $img = $('<img class="oe_field_translate oe_input_icon" src="/web/static/src/img/icons/terp-translate.png" width="16" height="16" border="0"/>')
                        .click(this.on_translate);
                    this.$cleditor.$toolbar.append($img);
                }
            }
        },

        add_image_button: function() {
            var self = this;
            $.cleditor.buttons.image = {
                name: 'image',
                title: _t('Insert/Upload Image'),
                command: 'insertimage',
                popupName: 'image',
                popupClass: 'cleditorPrompt',
                stripIndex: $.cleditor.buttons.image.stripIndex,
                popupContent: 'Please configure imageListUrl',
                buttonClick: self.insertImageClick,
                uploadUrl: '/web/binary/upload_attachment',
                imageListUrl: '/web/ir_attachment/imagelist'
            };
        },

        insertImageClick: function(e, data) {
            createDlg($.cleditor.buttons.image.imageListUrl, $.cleditor.buttons.image.uploadUrl, data);
        },

    });

};

// vim:et fdc=0 fdl=0 foldnestmax=3 fdm=syntax:
