import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { z } from "zod";
import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { MoneyInput } from "./money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  TRANSACTION_CATEGORY_OPTIONS,
  TRANSACTION_INVESTMENTS_CATEGORY_OPTIONS,
  TRANSACTION_PAYMENT_METHOD_OPTIONS,
  TRANSACTION_TYPES_OPTIONS,
} from "../_constants/transactions";
import { DatePicker } from "./ui/date-picker";
import { upsertTransaction } from "../_actions/add-transaction";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Checkbox } from "./ui/checkbox";

interface UpsertTransactionDialogProps {
  isOpen: boolean;
  defaultValues?: Partial<FormSchema>;
  transactionId?: string;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().trim().min(1, {
    message: "O nome é obrigatório.",
  }),
  amount: z
    .number({
      required_error: "O valor é obrigatório.",
    })
    .positive({
      message: "O valor deve ser positivo.",
    })
    .max(999999.99, {
      message: "O valor máximo deve ser de até R$999.999,99.",
    }),
  type: z.nativeEnum(TransactionType, {
    required_error: "O tipo é obrigatório.",
  }),
  category: z.nativeEnum(TransactionCategory, {
    required_error: "A categoria é obrigatória.",
  }),
  paymentMethod: z.nativeEnum(TransactionPaymentMethod, {
    required_error: "O método de pagamento é obrigatório.",
  }),
  date: z.date({
    required_error: "A data é obrigatória.",
  }),
  installments: z
    .number()
    .min(1, "O número de parcelas deve ser no mínimo 1.")
    .max(42, "O número de parcelas deve ser no máximo 42.")
    .optional()
    .default(1),
  isRecurring: z.boolean().default(false),
});

type FormSchema = z.infer<typeof formSchema>;

const UpsertTransactionDialog = ({
  isOpen,
  defaultValues,
  transactionId,
  setIsOpen,
  onSuccess,
}: UpsertTransactionDialogProps) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          date:
            typeof defaultValues.date === "string"
              ? new Date(defaultValues.date)
              : defaultValues.date,
          installments: defaultValues.installments
            ? parseInt(defaultValues.installments.toString(), 10)
            : defaultValues.installments,
        }
      : {
          name: "",
          amount: 0,
          category: TransactionCategory.OTHER,
          date: new Date(),
          paymentMethod: TransactionPaymentMethod.CASH,
          type: TransactionType.EXPENSE,
          installments: 1,
          isRecurring: false,
        },
  });
  const isRecurring = form.watch("isRecurring");

  const [selectedType, setSelectedType] = useState<TransactionType | undefined>(
    defaultValues?.type,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    TransactionPaymentMethod | undefined
  >(defaultValues?.paymentMethod);

  useEffect(() => {
    // Sempre que os valores padrão mudarem (ou seja, ao abrir para edição),
    // ou quando o diálogo abrir, resete o formulário com os novos dados.
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        date: new Date(defaultValues.date!), // Garante que a data é um objeto Date
      });
      // Atualiza também os estados locais que controlam a UI
      setSelectedType(defaultValues.type);
      setSelectedPaymentMethod(defaultValues.paymentMethod);
    } else {
      // Se não houver valores padrão (modo de criação), resete para o estado inicial
      form.reset({
        name: "",
        amount: 0,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OTHER,
        paymentMethod: TransactionPaymentMethod.CASH,
        date: new Date(),
        installments: 1,
        isRecurring: false,
      });
      setSelectedType(TransactionType.EXPENSE);
      setSelectedPaymentMethod(TransactionPaymentMethod.CASH);
    }
  }, [defaultValues, isOpen, form]);

  // Alterando o estado do tipo ao selecionar um novo tipo
  const handleTypeChange = (value: string) => {
    const newType = value as TransactionType;
    setSelectedType(newType);
    form.setValue("type", newType); // Atualiza o valor do formulário
  };

  // Alterando o estado do método de pagamento ao selecionar um novo método
  const handlePaymentMethodChange = (value: string) => {
    const newMethod = value as TransactionPaymentMethod;
    setSelectedPaymentMethod(newMethod);
    form.setValue("paymentMethod", newMethod);
  };

  const showRecurringField = selectedType === TransactionType.EXPENSE;

  // Transforma em true ou false o showInstallMents caso a escolha seja despesa e cartão de crédito.
  const showInstallmentsField =
    selectedType === TransactionType.EXPENSE &&
    selectedPaymentMethod === TransactionPaymentMethod.CREDIT_CARD &&
    !isRecurring;

  // Definir opções de categoria com base no tipo selecionado
  const filteredCategoryOptions =
    selectedType === TransactionType.INVESTMENT
      ? TRANSACTION_INVESTMENTS_CATEGORY_OPTIONS
      : TRANSACTION_CATEGORY_OPTIONS;

  const onSubmit = async (data: FormSchema) => {
    try {
      const finalData = {
        ...data,
        // Se a transação for recorrente, o número de parcelas é sempre 1.
        // Se o campo de parcelas não estiver visível, também é 1.
        installments:
          isRecurring || !showInstallmentsField ? 1 : data.installments,
      };
      await upsertTransaction({ ...finalData, id: transactionId });
      setIsOpen(false);
      toast.success(
        transactionId
          ? "Transação atualizada com sucesso."
          : "Transação adicionada com sucesso.",
      );
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao salvar a transação.",
      );
    }
  };

  const isUpdate = Boolean(transactionId);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild></DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Atualizar" : "Criar"} transação
          </DialogTitle>
          <DialogDescription>Insira as informações abaixo</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <MoneyInput
                      placeholder="Digite o valor..."
                      value={field.value}
                      onValueChange={({ floatValue }) =>
                        field.onChange(floatValue)
                      }
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      handleTypeChange(value);
                      field.onChange(value); // Atualiza o valor do tipo
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_TYPES_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      handlePaymentMethodChange(value);
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma forma de pagamento." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_PAYMENT_METHOD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showRecurringField && (
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Despesa Recorrente</FormLabel>
                      <DialogDescription>
                        Esta despesa repete-se todos os meses.
                      </DialogDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Campo de Parcelas Condicional */}
            {showInstallmentsField && (
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade de Parcelas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Digite a quantidade de Parcelas"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da transação</FormLabel>
                  <DatePicker
                    value={field.value}
                    onChange={(date) => field.onChange(date || new Date())}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">
                {isUpdate ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertTransactionDialog;
