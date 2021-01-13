// Copyright (c) 2020, KCSC and contributors
// For license information, please see license.txt

frappe.ui.form.on('Cheque Management', {
	// refresh: function(frm) {

	// }
});


frappe.ui.form.on("Cheque Management","onload", function(frm, cdt, cdn) {
  cur_frm.fields_dict["cheque_lines"].grid.wrapper.find(".grid-add-row").hide();
  cur_frm.fields_dict["cheque_lines"].grid.wrapper.find(".grid-remove-rows").hide();
  this.frm.get_field("cheque_lines").grid.cannot_add_rows = true;
});

new frappe.ui.form.MultiSelectDialog({
    doctype: "Payment Entry",
    target: this.cur_frm,
    setters: {
        payment_type: "Receive"
    },
    date_field: "payment_type",
    get_query() {
        return {
            filters: { payment_type: ['!=', "Pay"] }
        }
    },
    action(selections) {
        console.log(selections);
    }
});

frappe.ui.form.on("Cheque Management", "refresh", function(frm) {
      //   frm.add_custom_button(__('Purchase Order'), function() {
      //
      //   let d =   new frappe.ui.form.MultiSelectDialog({
      //         doctype: "Payment Entry",
      //         target: this.cur_frm,
      //         setters: {
      //             payment_type: "Receive"
      //         },
      //         date_field: "payment_type",
      //         get_query() {
      //             return {
      //                 filters: { docstatus: ['!=', 2] }
      //             }
      //         },
      //         action(selections) {
      //             console.log(selections);
      //
      //         }
      //     });
      //     d.show;
      //     show_alert("Hi Muna", 5);
      // });



      frm.add_custom_button(__('Purchase Order'), function() {
      erpnext.utils.map_current_doc({
        method: "erpnext.buying.doctype.purchase_order.purchase_order.make_purchase_invoice",
        source_doctype: "Purchase Order",
        target: me.frm,
        setters: {
          supplier: "Yasser",
        },
        get_query_filters: {
          docstatus: 1,
          status: ["not in", ["Closed", "On Hold"]],
          per_billed: ["<", 99.99],
          company: me.frm.doc.company
        }
      })
      show_alert("Hi Muna", 5);
    }, __("Get items from"));

});
