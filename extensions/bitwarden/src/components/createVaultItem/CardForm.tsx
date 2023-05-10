import { Form } from "@raycast/api";
import { useFormContext } from "~/context/form";
import { MONTH_NUMBER_TO_LABEL_MAP } from "~/constants/labels";
import { Card, CreateItemPayload } from "~/types/vault";
import useOnUnmount from "~/utils/hooks/useOnUnmount";

const CARD_DEFAULT_VALUES: Card = {
  cardholderName: null,
  brand: null,
  number: null,
  expMonth: null,
  expYear: null,
  code: null,
};

function CardForm() {
  const { setField, defaultValues } = useFormContext<CreateItemPayload>();

  useOnUnmount(() => setField("card", defaultValues["card"]), []);

  const handleFieldChange =
    <TField extends keyof Card>(field: TField) =>
    (value: Card[TField]) => {
      setField("card", (card) => ({ ...CARD_DEFAULT_VALUES, ...card, [field]: value }));
    };

  return (
    <>
      <Form.TextField id="cardholderName" title="Cardholder name" onChange={handleFieldChange("cardholderName")} />
      <Form.TextField id="brand" title="Brand" onChange={handleFieldChange("brand")} />
      <Form.TextField id="number" title="Number" onChange={handleFieldChange("number")} />
      <Form.Dropdown id="expMonth" title="Expiration month" onChange={handleFieldChange("expMonth")}>
        {Object.entries(MONTH_NUMBER_TO_LABEL_MAP).map(([key, value]) => (
          <Form.Dropdown.Item key={key} value={key} title={value} />
        ))}
      </Form.Dropdown>
      <Form.TextField id="expYear" title="Expiration year" onChange={handleFieldChange("expYear")} />
      <Form.TextField id="code" title="Security code (CVV)" onChange={handleFieldChange("code")} />
    </>
  );
}

export default CardForm;
