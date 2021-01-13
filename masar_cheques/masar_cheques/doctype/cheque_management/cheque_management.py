# -*- coding: utf-8 -*-
# Copyright (c) 2020, KCSC and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import frappe, erpnext
from frappe.model.document import Document
from frappe import throw, msgprint, _

class ChequeManagement(Document):
	pass


@frappe.whitelist()
def TestMSG():
	frappe.msgprint("Hi ,Test")
	
