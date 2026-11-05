import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import AddOnService from "../../services/add-on.service";
import type { IAddOnResponse } from "../../models/add-on/add-on.response.model";
import { useAddOnStore } from "../../stores/data/add-on.store";
import { showPopConfirmation, Toast } from "../../utils/http_service";
import { getApiErrorMessage } from "../../utils/helpers";
import { ADD_ONS_KEY, PRODUCT_ALL_KEY, PRODUCT_LIST_KEY } from "../../constants/constantQueryKeys";

export const useAddOnsQuery = () => useQuery({ queryKey: ADD_ONS_KEY, queryFn: AddOnService.getAll });

export const useAddOnHook = () => {
  const queryClient = useQueryClient();
  const addOnsQuery = useAddOnsQuery();
  const { editingAddOn, setEditingAddOn } = useAddOnStore();

  const deleteMutation = useMutation({
    mutationFn: AddOnService.deleteAddOn,
    onSuccess: (response: IAddOnResponse) => {
      Toast.fire({ icon: "success", title: `${response.name} deleted` });
      if (editingAddOn?.id === response.id) setEditingAddOn(null);
      queryClient.invalidateQueries(ADD_ONS_KEY);
      // Products that offered it no longer list it.
      queryClient.invalidateQueries(PRODUCT_LIST_KEY);
      queryClient.invalidateQueries(PRODUCT_ALL_KEY);
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The add-on couldn't be deleted.") }),
  });

  const handleDelete = (record: IAddOnResponse) => {
    showPopConfirmation({
      title: `Delete ${record.name}?`,
      text: record.productCount
        ? `It's taken off the ${record.productCount} product${record.productCount > 1 ? "s" : ""} that offer it.`
        : "No product offers it yet.",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(record.id);
    });
  };

  return {
    addOnsQuery,
    editingAddOn,
    setEditingAddOn,
    handleDelete,
    isDeleting: deleteMutation.isLoading,
  };
};
