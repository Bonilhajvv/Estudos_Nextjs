// app/lib/actions.ts
'use server';

import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// Esquema de validação para faturas
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateInvoiceSchema = FormSchema.omit({ id: true, date: true });
const UpdateInvoiceSchema = FormSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

// Função para criar uma nova fatura
export async function createInvoice(prevState: State, formData: FormData) {
    // Valida os campos usando Zod
    const validatedFields = CreateInvoiceSchema.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // Se a validação falhar, retorna os erros
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    // Prepara os dados para inserção
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // Insere os dados no banco de dados
    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        console.error("Erro ao criar fatura:", error);
        return { message: 'Database Error: Failed to Create Invoice.' };
    }

    // Revalida o cache e redireciona
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

// Função para atualizar uma fatura existente
export async function updateInvoice(id: string, formData: FormData) {
    // Valida os campos usando Zod
    const validatedFields = UpdateInvoiceSchema.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // Se a validação falhar, retorna os erros
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid Fields. Failed to Update Invoice.',
        };
    }

    // Prepara os dados para atualização
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;

        // Revalida o cache e redireciona
        revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');
    } catch (error) {
        console.error("Erro ao atualizar fatura:", error);
        return { message: 'Database Error: Failed to Update Invoice.' };
    }
}

// Função para deletar uma fatura
export async function deleteInvoice(id: string) {
    try {
        await sql`
            DELETE FROM invoices WHERE id = ${id}
        `;

        // Revalida o cache e redireciona
        revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');
    } catch (error) {
        console.error("Erro ao deletar fatura:", error);
        return { message: 'Database Error: Failed to Delete Invoice.' };
    }
}
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}