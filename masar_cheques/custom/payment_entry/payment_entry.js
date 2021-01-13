frappe.ui.form.on("Payment Entry Cheque", "cheque_amount", function(frm, cdt, cdn) {
   //show_alert("Hi Zizo", 5);
   var cheques_details = frm.doc.payment_cheques;
   var total = 0
   for(var i in cheques_details) {
	total = total + cheques_details[i].cheque_amount
	}

	frm.set_value("total_cheques_amount",total)

});

frappe.ui.form.on('Payment Entry',  {
    validate: function(frm) {
    if(frm.doc.mode_of_payment == "Cheque"){
      if(cur_frm.doc.paid_amount != cur_frm.doc.total_cheques_amount){
          msgprint('Cheques Total Amount is not equal to Paid Amount');
          validated = false;
       }
     }
    }
});

frappe.ui.form.on('Payment Entry', {
    validate: function(frm) {
        $.each(frm.doc.payment_cheques, function(i, d) {
            if(frm.doc.payment_type == "Receive"){
              d.paid_from = frm.doc.paid_from;
              d.paid_from_account_currency = frm.doc.paid_from_account_currency;
              // // Check if Account is Cash
              // frappe.db.get_value("Account", {"name": d.paid_to}, "account_type", function(value) {
              //   if (value.account_type == "Cash"){
              //       d.cheque_status = "Received";
              //     }
              // });
              //
              // // Check if Account is Bank
              // frappe.db.get_value("Account", {"name": d.paid_to}, "account_type", function(value) {
              //   if (value.account_type == "Bank"){
              //       d.cheque_status = "Collected";
              //     }
              // });
              //
              // // Check if Account is Under Collection
              // frappe.db.get_value("Account", {"name": d.paid_to}, "under_collection", function(value) {
              //   if (value.under_collection == 1){
              //       d.cheque_status = "Under Collection";
              //     }
              // });
            }
            if(frm.doc.payment_type == "Pay"){
              d.paid_to = frm.doc.paid_to;
              d.paid_to_account_currency = frm.doc.paid_to_account_currency;
            }
						d.payment_type = frm.doc.payment_type
						d.party_type = frm.doc.party_type
						d.party = frm.doc.party

        });
    }
})

frappe.ui.form.on("Payment Entry","onload", function(frm, cdt, cdn) {

  cur_frm.fields_dict['cheque_management_line'].grid.wrapper.find('.grid-add-row').hide();
  cur_frm.fields_dict['cheque_management_line'].grid.wrapper.find('.grid-remove-rows').hide();

//Set Read Only to Account
    if(frm.doc.payment_type == "Pay"){
        var dt = frappe.meta.get_docfield("Payment Entry Cheque","paid_to", cur_frm.doc.name);
      dt.read_only = 1;

      var df = frappe.meta.get_docfield("Payment Entry Cheque","paid_from", cur_frm.doc.name);
      df.read_only = 0;
    }
    else if(frm.doc.payment_type == "Receive"){
      var df = frappe.meta.get_docfield("Payment Entry Cheque","paid_from", cur_frm.doc.name);
      df.read_only = 1;

      var dt = frappe.meta.get_docfield("Payment Entry Cheque","paid_to", cur_frm.doc.name);
      dt.read_only = 0;
    }

});



frappe.ui.form.on("Payment Entry Cheque", "payment_cheques_add", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
        if(frm.doc.payment_type == "Pay"){
          d.paid_from = frm.doc.paid_from;
          d.paid_from_account_currency = frm.doc.paid_from_account_currency;

          d.paid_to = frm.doc.paid_to;
          d.paid_to_account_currency = frm.doc.paid_to_account_currency;

        }
        else if(frm.doc.payment_type == "Receive"){
          d.paid_to = frm.doc.paid_to;
          d.paid_to_account_currency = frm.doc.paid_to_account_currency;

          d.paid_from = frm.doc.paid_from;
          d.paid_from_account_currency = frm.doc.paid_from_account_currency;


        }
  });
