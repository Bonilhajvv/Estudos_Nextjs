'use client';

import { updateInvoice } from '@/app/lib/actions';
import { CustomerField, InvoiceForm } from '@/app/lib/definitions';
import { useRouter } from 'next/navigation';

export default function EditInvoiceForm({
  invoice,
  customers,
}: {
  invoice: InvoiceForm;
  customers: CustomerField[];
}) {
  const router = useRouter();
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);

  return (
    <form action={updateInvoiceWithId}>
      <input type="hidden" name="id" value={invoice.id} />

      {/* Campos do formulário para edição */}
      <div className="mb-4">
        <label htmlFor="customer" className="block text-sm font-medium mb-2">
          Choose customer
        </label>
        <select
          id="customer"
          name="customerId"
          defaultValue={invoice.customer_id}
          className="block w-full border rounded-md py-2 px-3"
        >
          <option value="" disabled>
            Select a customer
          </option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium mb-2">
          Choose an amount
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          defaultValue={invoice.amount}
          className="block w-full border rounded-md py-2 px-3"
          placeholder="Enter amount"
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium mb-2">Set the invoice status</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="pending"
              defaultChecked={invoice.status === 'pending'}
              className="form-radio"
            />
            <span>Pending</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="paid"
              defaultChecked={invoice.status === 'paid'}
              className="form-radio"
            />
            <span>Paid</span>
          </label>
        </div>
      </fieldset>

      {/* Botões de ação */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/invoices')}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md"
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Edit Invoice
        </button>
      </div>
    </form>
  );
}