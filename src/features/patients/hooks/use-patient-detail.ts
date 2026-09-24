"use client";

import { useCallback, useEffect } from "react";

import { useApi } from "@/hooks/use-api";
import type { PatientDetail } from "@/types/patient";
import type { PatientBalance } from "@/types/session";

function usePatientDetail(patientId: string) {
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
    fetchBalance("GET", `/api/patients/${patientId}/balance`);
  }, [fetchPatient, fetchBalance, patientId]);

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
