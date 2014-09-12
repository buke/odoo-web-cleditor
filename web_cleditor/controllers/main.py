# -*- coding: utf-8 -*-
##############################################################################
#
#    Better WYSIWYG Cleditor
#    Copyright 2014 wangbuke <wangbuke@gmail.com>
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from openerp.addons.web.http import Controller, route, request
class ImageListController(Controller):

    @route('/web/ir_attachment/imagelist', type='json', auth="user")
    def imagelist(self, **data):
        attachment_obj = request.registry['ir.attachment']
        cr, uid, context = request.cr, request.uid, request.context
        imagelist = []
        attachment_ids = attachment_obj.search(cr, uid, [("res_model","=","ir.ui.menu"), ("mimetype","=like","image/%")])
        imagelist = ['/web/binary/image?model=ir.attachment&field=datas&id=%d' % id for id in  attachment_ids]
        return imagelist

