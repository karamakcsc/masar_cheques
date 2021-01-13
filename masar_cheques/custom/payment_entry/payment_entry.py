from __future__ import unicode_literals
import frappe, erpnext
from frappe.utils import flt, cstr, nowdate, comma_and
from frappe import throw, msgprint, _
from frappe.custom.doctype.custom_field.custom_field import create_custom_field

def p_before_submit(self, method):
    set_cheque_status(self)




def set_cheque_status(self):
    if self.mode_of_payment == "Cheque":
            if self.payment_type == "Receive":
                for d in self.get("payment_cheques"):
                    acc_doc = frappe.get_doc("Account", d.paid_to)

                    #Cash
                    if acc_doc.account_type == "Cash":
                        d.cheque_status = "Received"

                    #Bank
                    if acc_doc.account_type == "Bank":
                        d.cheque_status = "Collected"

                    #Under Collection
                    if acc_doc.under_collection == 1:
                        d.cheque_status = "Under Collection"
