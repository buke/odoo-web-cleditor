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

from openerp.osv import osv, fields
import mimetypes

class ir_attachment(osv.osv):
    _inherit = "ir.attachment"

    _columns = {
        'mimetype': fields.char('Mime Type', readonly=True),
    }

    def _add_mimetype_if_needed(self, values):
        if values.get('datas_fname'):
            values['mimetype'] = mimetypes.guess_type(values.get('datas_fname'))[0] or 'application/octet-stream'

    def create(self, cr, uid, values, context=None):
        self._add_mimetype_if_needed(values)
        return super(ir_attachment, self).create(cr, uid, values, context=context)

    def write(self, cr, uid, ids, values, context=None):
        self._add_mimetype_if_needed(values)
        return super(ir_attachment, self).write(cr, uid, ids, values, context=context)




# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
