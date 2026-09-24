type Payment = {
  id: string;
  session_id: string;
  amount: number;
  payment_date: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

export { type Payment };
