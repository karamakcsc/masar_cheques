import frappe
import erpnext
from frappe import throw, msgprint, _
from erpnext.accounts.doctype.payment_entry.payment_entry import PaymentEntry


def custom_add_bank_gl_entries(self, gl_entries):
	if self.mode_of_payment == "Cheque":
			if self.payment_type in ("Pay", "Internal Transfer"):
				for d in self.get("payment_cheques"):
						gl_entries.append(
							self.get_gl_dict({
								"account": d.paid_from,
								"account_currency": self.paid_from_account_currency,
								"against": self.party if self.payment_type == "Pay" else self.paid_to,
								"credit_in_account_currency": d.cheque_amount,
								"credit": d.cheque_amount,
								"cost_center": self.cost_center,
								"remarks": "Cheque No " + d.cheque_no
							}, item=self)
						)
			if self.payment_type in ("Receive", "Internal Transfer"):
				for d in self.get("payment_cheques"):
						gl_entries.append(
							self.get_gl_dict({
								"account": d.paid_to,
								"account_currency": d.paid_to_account_currency,
								"against": self.party if self.payment_type == "Receive" else self.paid_from,
								"debit_in_account_currency": d.cheque_amount,
								"debit": d.cheque_amount,
								"cost_center": self.cost_center,
								"remarks": "Cheque No " + d.cheque_no
							}, item=self)
						)
	else:
			if self.payment_type in ("Pay", "Internal Transfer"):
					gl_entries.append(
						self.get_gl_dict({
							"account": self.paid_from,
							"account_currency": self.paid_from_account_currency,
							"against": self.party if self.payment_type == "Pay" else self.paid_to,
							"credit_in_account_currency": self.paid_amount,
							"credit": self.base_paid_amount,
							"cost_center": self.cost_center
						}, item=self)
					)
			if self.payment_type in ("Receive", "Internal Transfer"):
					gl_entries.append(
						self.get_gl_dict({
							"account": self.paid_to,
							"account_currency": self.paid_to_account_currency,
							"against": self.party if self.payment_type=="Receive" else self.paid_from,
							"debit_in_account_currency": self.received_amount,
							"debit": self.base_received_amount,
							"cost_center": self.cost_center
						}, item=self)
					)


def override_payment_entry():
	PaymentEntry.add_bank_gl_entries = custom_add_bank_gl_entries


def execute_override(self,method):
	override_payment_entry()
