import { useEffect } from "react";
import { Form } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import CategoryService from "../../services/category.service";
import type { ICategoryRequest } from "../../models/category/category.request.model";
import type { ICategoryResponse } from "../../models/category/category.response.model";
import { CategoryIconEnum } from "../../enums/product.enum";
import { useCategoryStore } from "../../stores/data/category.store";
import { Toast } from "../../utils/http_service";
import { getApiErrorMessage } from "../../utils/helpers";
import { CATEGORIES_KEY, PRODUCT_ALL_KEY, PRODUCT_LIST_KEY } from "../../constants/constantQueryKeys";

// The form at the top of the categories panel: adds, or edits the category picked below it.
export const useCategoryFormHook = () => {
  const [form] = Form.useForm<ICategoryRequest>();
  const queryClient = useQueryClient();
  const { editingCategory, setEditingCategory } = useCategoryStore();
  const isEditing = !!editingCategory;

  useEffect(() => {
    if (editingCategory) form.setFieldsValue({ name: editingCategory.name, icon: editingCategory.icon });
    else form.setFieldsValue({ name: "", icon: CategoryIconEnum.hot });
  }, [editingCategory, form]);

  const categoryMutation = useMutation({
    mutationFn: (request: ICategoryRequest) =>
      isEditing ? CategoryService.update(request) : CategoryService.create(request),
    onSuccess: (response: ICategoryResponse) => {
      Toast.fire({ icon: "success", title: isEditing ? `${response.name} saved` : `${response.name} added` });
      queryClient.invalidateQueries(CATEGORIES_KEY);
      // Product rows show the category's name and icon.
      if (isEditing) {
        queryClient.invalidateQueries(PRODUCT_LIST_KEY);
        queryClient.invalidateQueries(PRODUCT_ALL_KEY);
      }
      setEditingCategory(null);
      form.setFieldsValue({ name: "", icon: CategoryIconEnum.hot });
    },
    onError: (error: AxiosError<{ message?: string; errors?: { title?: string }[] }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The category couldn't be saved.") }),
  });

  const handleSubmit = (values: ICategoryRequest) =>
    categoryMutation.mutate({ id: editingCategory?.id, name: values.name.trim(), icon: values.icon });

  return {
    form,
    isEditing,
    handleSubmit,
    handleCancelEdit: () => setEditingCategory(null),
    isSaving: categoryMutation.isLoading,
  };
};
