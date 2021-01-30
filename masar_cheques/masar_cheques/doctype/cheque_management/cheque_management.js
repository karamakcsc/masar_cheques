// Copyright (c) 2020, KCSC and contributors
// For license information, please see license.txt


// Hide Hide Add Button for Cheque Lines Grid
frappe.ui.form.on("Cheque Management", "onload", function(frm, cdt, cdn) {
  cur_frm.fields_dict["cheque_lines"].grid.wrapper.find(".grid-add-row").hide();
  cur_frm.fields_dict["cheque_lines"].grid.wrapper.find(".grid-remove-rows").hide();
  this.frm.get_field("cheque_lines").grid.cannot_add_rows = true;
});

// Get CHeques - Handle MultiSelectDialog
frappe.ui.form.on("Cheque Management", "refresh", function(frm) {
  frm.add_custom_button(__('Get Cheques'), function() {
    var ch_status;
    var vr_account;
    if (frm.doc.payment_type == "Receive") {
      switch (frm.doc.transaction_type) {
        case 'Deposit':
          ch_status = 'Received';
          vr_account = frm.doc.from_account;
          break;
        case 'Collect':
          ch_status = 'Under Collection';
          vr_account = frm.doc.from_account;
          break;
        case 'Return':
          ch_status = 'Collected';
          vr_account = frm.doc.from_account;
      }
    } else if (frm.doc.payment_type == "Pay") {
      switch (frm.doc.transaction_type) {
        case 'Collect':
          ch_status = 'Post-Dated Cheque';
          vr_account = frm.doc.to_account;
          break;
        case 'Return':
          ch_status = 'Paid';
          vr_account = frm.doc.from_account;
      }
    }

    var d = new frappe.ui.form.MultiSelectDialog({
      doctype: "Cheque",
      target: me.frm,
      setters: {
        cheque_no: "",
        cheque_value_date: "",
        cheque_bank: ""
      },
      date_field: "cheque_value_date",
      get_query() {
        return {

          filters: {
            cheque_status: ['=', ch_status],
            current_account: ['in', [vr_account]]
            //current_account: ['in', vr_account]
          }
        }
      },
      primary_action_label: "Get Cheques",
      action(cheques) {
        frappe.call({
          method: "masar_cheques.masar_cheques.doctype.cheque_management.cheque_management.insert_selected_cheques",
          args: {
            cheques: cheques
          },
          callback: function(r) {
            $.each(r.message, function(i, d) {
              var row = frappe.model.add_child(cur_frm.doc, "Cheque Management Line", "cheque_lines");
              row.cheque = d.cheque;
              row.cheque_no = d.cheque_no;
              row.cheque_value_date = d.cheque_value_date;
              row.cheque_bank = d.cheque_bank;
              row.cheque_amount = d.cheque_amount;
              row.party_type = d.party_type;
              row.party = d.party;
              row.paid_from = frm.doc.from_account;
              row.paid_to = frm.doc.to_account;
              row.paid_from_account_currency = frm.doc.paid_from_account_currency
              row.paid_to_account_currency = frm.doc.paid_to_account_currency
              refresh_field("cheque_lines");
            });

          }
        });

        d.dialog.hide();
      }
    });
  });

});


frappe.ui.form.on("Cheque Management", "payment_type", function(frm) {
  if (frm.doc.payment_type == "Receive") {
    set_field_options("transaction_type", ["Deposit", "Collect", "Return"])
  } else if (frm.doc.payment_type == "Pay") {
    set_field_options("transaction_type", ["Collect", "Return"])
  } else if (frm.doc.payment_type == "") {
    set_field_options("transaction_type", [""])
  }
});


// Filter From Account List When Based on Transaction Type
function SetListFilter(frm) {
  if (!frm.doc.transaction_type || !frm.doc.bank) {
    frm.set_query("from_account", function() {
      return {
        filters: [
          ["Account", "account_type", "in", ["Nothing"]]
        ]
      }
    });

    frm.set_query("to_account", function() {
      return {
        filters: [
          ["Account", "account_type", "in", ["Nothing"]]
        ]
      }
    });
  } else if (frm.doc.transaction_type == "Deposit" && frm.doc.payment_type == "Receive") {
    frm.set_query("from_account", function() {
      return {
        filters: [
          ["Account", "account_type", "in", ["Cash"]]
        ]
      }
    });
    frm.set_query("to_account", function() {
      return {
        filters: [
          ["Account", "bank", "in", [frm.doc.bank]]
        ]
      }
    });
  } else if (frm.doc.transaction_type == "Collect" && frm.doc.payment_type == "Receive") {
    frm.set_query("from_account", function() {
      return {
        filters: [
          ["Account", "under_collection", "in", ["1"]]
        ]
      }
    });
    frm.set_query("to_account", function() {
      return {
        filters: [
          ["Account", "bank", "in", [frm.doc.bank]]
        ]
      }
    });
  } else if (frm.doc.transaction_type == "Return" && frm.doc.payment_type == "Receive") {
    frm.set_query("from_account", function() {
      return {
        filters: [
          ["Account", "bank", "in", [frm.doc.bank]]
        ]
      }
    });
    frm.set_query("to_account", function() {
      return {
        filters: [
          ["Account", "account_type", "in", ["Receivable", "Payable"]]
        ]
      }
    });
  } else if (frm.doc.transaction_type == "Collect" && frm.doc.payment_type == "Pay") {
    frm.set_query("from_account", function() {
      return {
        filters: [
          ["Account", "bank", "in", [frm.doc.bank]]
        ]
      }
    });
    frm.set_query("to_account", function() {
      return {
        filters: [
          ["Account", "post_dated_cheque", "in", ["1"]]
        ]
      }
    });
  } else if (frm.doc.transaction_type == "Return" && frm.doc.payment_type == "Pay") {
    frm.set_query("from_account", function() {
      return {
        filters: [
          ["Account", "account_type", "in", ["Receivable", "Payable"]]
        ]
      }
    });
    frm.set_query("to_account", function() {
      return {
        filters: [
          ["Account", "bank", "in", [frm.doc.bank]]]
      }
    });
  }
};


frappe.ui.form.on("Cheque Management", {
  setup: function(frm) {
    frm.set_value("posting_date",frappe.datetime.nowdate());

    SetListFilter(frm);

  },
  payment_type: function(frm) {
    SetListFilter(frm);

  },
  transaction_type: function(frm) {
    SetListFilter(frm);

  },
  bank: function(frm) {
    SetListFilter(frm);
  }

});



frappe.ui.form.on('Cheque Management', {
  validate: function(frm) {
    $.each(frm.doc.cheque_lines, function(i, d) {
      d.paid_from = frm.doc.from_account;
      d.paid_from_account_currency = frm.doc.paid_from_account_currency;
      d.paid_to = frm.doc.to_account;
      d.paid_to_account_currency = frm.doc.paid_to_account_currency;
    });
  }
});

frappe.ui.form.on('Cheque Management', {
  refresh: function(frm) {
    frm.events.show_general_ledger(frm);
  }
});

frappe.ui.form.on('Cheque Management', {
show_general_ledger: function(frm) {
  if(frm.doc.docstatus > 0) {
    frm.add_custom_button(__('Ledger'), function() {
      frappe.route_options = {
        "voucher_no": frm.doc.name,
        "from_date": frm.doc.posting_date,
        "to_date": moment(frm.doc.modified).format('YYYY-MM-DD'),
        "company": frm.doc.company,
        "group_by": "",
        "show_cancelled_entries": frm.doc.docstatus === 2
      };
      frappe.set_route("query-report", "General Ledger");
    }, "fa fa-table");
  }
}
});
