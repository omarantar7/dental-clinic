"use client";

import { useCallback, useEffect } from "react";

import { useApi } from "@/hooks/use-api";
import type { PatientDetail } from "@/types/patient";
import type { PatientBalance } from "@/types/session";

// includeBalance is false for users without PAYMENTS_VIEW, whose balance
// request would only come back 403.
function usePatientDetail(
  patientId: string,
  { includeBalance }: { includeBalance: boolean },
) {
  const {
    data: patient,
    error,
    isLoading: isLoadingPatient,
    request: fetchPatient,
  } = useApi<PatientDetail>();
  const { data: balance, isLoading: isLoadingBalance, request: fetchBalance } =
    useApi<PatientBalance>();

  const refetch = useCallback(() => {
    fetchPatient("GET", `/api/patients/${patientId}`);
    if (includeBalance) {
      fetchBalance("GET", `/api/patients/${patientId}/balance`);
    }
  }, [fetchPatient, fetchBalance, patientId, includeBalance]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    patient,
    balance,
    isLoading: isLoadingPatient || isLoadingBalance,
    error,
    refetch,
  };
}

export { usePatientDetail };
