import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import CategoryService from "../../services/category.service";
import type { ICategoryResponse } from "../../models/category/category.response.model";
import { useCategoryStore } from "../../stores/data/category.store";
import { showPopConfirmation, Toast } from "../../utils/http_service";
import { getApiErrorMessage } from "../../utils/helpers";
import { CATEGORIES_KEY } from "../../constants/constantQueryKeys";

// Small list, fetched whole; the same key serves the products page, the form's select and this panel.
export const useCategoriesQuery = () => useQuery({ queryKey: CATEGORIES_KEY, queryFn: CategoryService.getAll });

export const useCategoryHook = () => {
  const queryClient = useQueryClient();
  const categoriesQuery = useCategoriesQuery();
  const { editingCategory, setEditingCategory } = useCategoryStore();

  const deleteMutation = useMutation({
    mutationFn: CategoryService.deleteCategory,
    onSuccess: (response: ICategoryResponse) => {
      Toast.fire({ icon: "success", title: `${response.name} deleted` });
      if (editingCategory?.id === response.id) setEditingCategory(null);
      queryClient.invalidateQueries(CATEGORIES_KEY);
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The category couldn't be deleted.") }),
  });

  const handleDelete = (record: ICategoryResponse) => {
    showPopConfirmation({
      title: `Delete ${record.name}?`,
      text: "It's removed from the menu. This can't be undone.",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(record.id);
    });
  };

  return {
    categoriesQuery,
    editingCategory,
    setEditingCategory,
    handleDelete,
    isDeleting: deleteMutation.isLoading,
  };
};
