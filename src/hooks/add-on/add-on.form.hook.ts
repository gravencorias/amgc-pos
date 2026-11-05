import { useEffect } from "react";
import { Form } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import AddOnService from "../../services/add-on.service";
import type { IAddOnRequest } from "../../models/add-on/add-on.request.model";
import type { IAddOnResponse } from "../../models/add-on/add-on.response.model";
import { useAddOnStore } from "../../stores/data/add-on.store";
import { Toast } from "../../utils/http_service";
import { getApiErrorMessage } from "../../utils/helpers";
import { ADD_ONS_KEY } from "../../constants/constantQueryKeys";

export const useAddOnFormHook = () => {
  const [form] = Form.useForm<IAddOnRequest>();
  const queryClient = useQueryClient();
  const { editingAddOn, setEditingAddOn } = useAddOnStore();
  const isEditing = !!editingAddOn;

  useEffect(() => {
    if (editingAddOn) form.setFieldsValue({ name: editingAddOn.name, price: editingAddOn.price });
    else form.resetFields();
  }, [editingAddOn, form]);

  const addOnMutation = useMutation({
    mutationFn: (request: IAddOnRequest) => (isEditing ? AddOnService.update(request) : AddOnService.create(request)),
    onSuccess: (response: IAddOnResponse) => {
      Toast.fire({ icon: "success", title: isEditing ? `${response.name} saved` : `${response.name} added` });
      queryClient.invalidateQueries(ADD_ONS_KEY);
      setEditingAddOn(null);
      form.resetFields();
    },
    onError: (error: AxiosError<{ message?: string; errors?: { title?: string }[] }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The add-on couldn't be saved.") }),
  });

  const handleSubmit = (values: IAddOnRequest) =>
    addOnMutation.mutate({ id: editingAddOn?.id, name: values.name.trim(), price: values.price });

  return {
    form,
    isEditing,
    handleSubmit,
    handleCancelEdit: () => setEditingAddOn(null),
    isSaving: addOnMutation.isLoading,
  };
};
