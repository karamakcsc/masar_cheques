# -*- coding: utf-8 -*-
# Copyright (c) 2020, KCSC and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, erpnext, json
from frappe import _, scrub, ValidationError
from frappe.utils import flt, comma_or, nowdate, getdate
from erpnext.setup.utils import get_exchange_rate
from erpnext.accounts.general_ledger import make_gl_entries
from erpnext.controllers.accounts_controller import AccountsController
from frappe.model.document import Document

class InvalidChequeManagement(ValidationError):
	pass

class ChequeManagement(AccountsController):
	def __init__(self, *args, **kwargs):
		super(ChequeManagement, self).__init__(*args, **kwargs)

	def validate(self):
		pass

	def on_submit(self):
		self.set_cheque_status()
		self.make_gl()


	def set_cheque_status(self):
		if self.payment_type == "Receive":
			for d in self.get("cheque_lines"):
				to_acc_doc = frappe.get_doc("Account", d.paid_to)
				cheque_doc = frappe.get_doc("Cheque", d.cheque)

				# Deposit
				if self.get("transaction_type") == "Deposit":
					cheque_doc.current_account = d.paid_to
					if to_acc_doc.under_collection == 0:
						cheque_doc.cheque_status = "Collected"
					else:
						cheque_doc.cheque_status = "Under Collection"
				# Collect
				if self.get("transaction_type") == "Collect":
					cheque_doc.current_account = d.paid_to
					cheque_doc.cheque_status = "Collected"

				# Return
				if self.get("transaction_type") == "Return":
					cheque_doc.current_account = d.paid_to
					cheque_doc.cheque_status = "Returned"

				cheque_doc.save()
		elif self.payment_type == "Pay":
			for d in self.get("cheque_lines"):
				to_acc_doc = frappe.get_doc("Account", d.paid_to)
				cheque_doc = frappe.get_doc("Cheque", d.cheque)
				# Collect
				if self.get("transaction_type") == "Collect":
					cheque_doc.current_account = cheque_doc.paid_to
					cheque_doc.cheque_status = "Paid"

				# Return
				if self.get("transaction_type") == "Return":
					cheque_doc.current_account = d.paid_to
					cheque_doc.cheque_status = "Returned"

				cheque_doc.save()



	def make_gl(self):
		gl_entries = []
		for d in self.get("cheque_lines"):
				gl_entries.append(
					self.get_gl_dict({
						"account": d.paid_from,
						"account_currency": d.paid_from_account_currency,
						"against": d.paid_to,
						"credit_in_account_currency": d.cheque_amount,
						"credit": d.cheque_amount,
						#"cost_center": self.cost_center,
						"remarks": "Cheque No " + d.cheque_no
					})
				)
				gl_entries.append(
					self.get_gl_dict({
						"account": d.paid_to,
						"account_currency": d.paid_to_account_currency,
						"against": d.paid_from,
						"debit_in_account_currency": d.cheque_amount,
						"debit": d.cheque_amount,
						#"cost_center": self.cost_center
						"remarks": "Cheque No " + d.cheque_no
					})
				)
		if gl_entries:
			make_gl_entries(gl_entries, cancel=0, adv_adj=0)

@frappe.whitelist()
def insert_selected_cheques(cheques):
	cheques = json.loads(cheques)
	rows = []
	for cheque in cheques:
		cheque_doc = frappe.get_doc("Cheque", cheque)
		rows.append({
			'cheque': cheque,
			'cheque_no': cheque_doc.cheque_no,
			'cheque_value_date': cheque_doc.cheque_value_date,
			'cheque_bank': cheque_doc.cheque_bank,
			'cheque_amount': cheque_doc.cheque_amount,
			'party_type': cheque_doc.party_type,
			'party': cheque_doc.party,
		})
	return rows
