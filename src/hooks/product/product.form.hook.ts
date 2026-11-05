import { useEffect } from "react";
import { Form } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import ProductService from "../../services/product.service";
import type { IProductFormValues, IProductRequest } from "../../models/product/product.request.model";
import type { IProductResponse } from "../../models/product/product.response.model";
import { useModalStore } from "../../stores/common/modal.store";
import { useProductStore } from "../../stores/data/product.store";
import { Toast } from "../../utils/http_service";
import { getApiErrorMessage } from "../../utils/helpers";
import { resizeImageToSquare } from "../../utils/image_resize";
import { useAddOnsQuery } from "../add-on/add-on.hook";
import { useCategoriesQuery } from "../category/category.hook";
import { ADD_ONS_KEY, CATEGORIES_KEY, PRODUCT_ALL_KEY, PRODUCT_LIST_KEY } from "../../constants/constantQueryKeys";

const PHOTO_SIZE = 480;

type ApiError = AxiosError<{ message?: string; errors?: { title?: string }[] }>;

// One form for adding and editing, keyed off editingProduct (null = adding).
// A picked photo waits in the store and is uploaded right after the product saves,
// so a new product (which has no id yet) can get its photo in the same step.
export const useProductFormHook = () => {
  const [form] = Form.useForm<IProductFormValues>();
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();
  const { editingProduct, setEditingProduct, pendingPhoto, setPendingPhoto, removePhoto, setRemovePhoto } =
    useProductStore();
  const categoriesQuery = useCategoriesQuery();
  const addOnsQuery = useAddOnsQuery();
  const isEditing = !!editingProduct;
  const hasSizes = Form.useWatch("hasSizes", form) ?? false;
  const categoryId = Form.useWatch("categoryId", form);
  const name = Form.useWatch("name", form);

  useEffect(() => {
    if (editingProduct) {
      form.setFieldsValue({
        name: editingProduct.name,
        categoryId: editingProduct.categoryId,
        price: editingProduct.sizes.length ? undefined : editingProduct.price,
        hasSizes: editingProduct.sizes.length > 0,
        sizes: editingProduct.sizes.length ? editingProduct.sizes : [{ name: "", price: 0 }],
        addOnIds: editingProduct.addOnIds,
        isAvailable: editingProduct.isAvailable,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        hasSizes: false,
        sizes: [
          { name: "12 oz", price: 0 },
          { name: "16 oz", price: 0 },
        ],
        addOnIds: [],
        isAvailable: true,
      });
    }
  }, [editingProduct, form]);

  const photoUploadMutation = useMutation({
    mutationFn: ({ id, blob }: { id: number; blob: Blob }) => ProductService.uploadPhoto(id, blob),
  });
  const photoRemoveMutation = useMutation({ mutationFn: ProductService.removePhoto });

  const productMutation = useMutation({
    mutationFn: (request: IProductRequest) =>
      isEditing ? ProductService.update(request) : ProductService.create(request),
    onSuccess: async (response: IProductResponse) => {
      // The product is saved either way; a failed photo step only warns.
      try {
        if (pendingPhoto) await photoUploadMutation.mutateAsync({ id: response.id, blob: pendingPhoto.blob });
        else if (removePhoto && editingProduct?.photoUrl) await photoRemoveMutation.mutateAsync(response.id);
        Toast.fire({ icon: "success", title: isEditing ? `${response.name} saved` : `${response.name} added to the menu` });
      } catch (error) {
        Toast.fire({
          icon: "warning",
          title: `${response.name} saved, but the photo wasn't: ${getApiErrorMessage(error as ApiError, "try again from Edit.")}`,
        });
      }
      queryClient.invalidateQueries(PRODUCT_LIST_KEY);
      queryClient.invalidateQueries(PRODUCT_ALL_KEY);
      queryClient.invalidateQueries(CATEGORIES_KEY);
      queryClient.invalidateQueries(ADD_ONS_KEY);
      handleClose();
    },
    onError: (error: ApiError) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The product couldn't be saved.") }),
  });

  const handleClose = () => {
    setEditingProduct(null);
    setPendingPhoto(null);
    setRemovePhoto(false);
    form.resetFields();
    closeModal();
  };

  const handleSubmit = (values: IProductFormValues) => {
    const sizes = values.hasSizes ? values.sizes.map((s) => ({ name: s.name.trim(), price: Number(s.price) })) : [];
    productMutation.mutate({
      id: editingProduct?.id,
      name: values.name.trim(),
      categoryId: values.categoryId,
      price: values.hasSizes ? Math.min(...sizes.map((s) => s.price)) : Number(values.price),
      sizes,
      addOnIds: values.addOnIds ?? [],
      isAvailable: values.isAvailable,
    });
  };

  // antd Upload's beforeUpload: crop and resize in the browser, keep it until save.
  const onPickPhoto = (file: File) => {
    resizeImageToSquare(file, PHOTO_SIZE)
      .then((blob) => {
        setPendingPhoto({ blob, previewUrl: URL.createObjectURL(blob) });
        setRemovePhoto(false);
      })
      .catch((error: Error) => Toast.fire({ icon: "error", title: error.message }));
    return false;
  };

  const onRemovePhoto = () => {
    setPendingPhoto(null);
    setRemovePhoto(true);
  };

  const photoUrl = pendingPhoto?.previewUrl ?? (removePhoto ? null : (editingProduct?.photoUrl ?? null));
  const category = categoriesQuery.data?.find((c) => c.id === categoryId);

  return {
    form,
    isEditing,
    hasSizes,
    categories: categoriesQuery.data ?? [],
    addOns: addOnsQuery.data ?? [],
    isLoadingOptions: categoriesQuery.isLoading || addOnsQuery.isLoading,
    photoUrl,
    photoPreviewName: name ?? editingProduct?.name ?? "",
    photoPreviewIcon: category?.icon ?? editingProduct?.categoryIcon,
    onPickPhoto,
    onRemovePhoto,
    handleClose,
    handleSubmit,
    isSaving: productMutation.isLoading || photoUploadMutation.isLoading || photoRemoveMutation.isLoading,
  };
};
