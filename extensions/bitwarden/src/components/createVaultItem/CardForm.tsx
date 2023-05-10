import { Form } from "@raycast/api";
import { useFormContext } from "~/context/form";
import { CARD_BRAND_TO_LABEL_MAP, MONTH_NUMBER_TO_LABEL_MAP } from "~/constants/labels";
import { Card, CardBrand, CreateItemPayload } from "~/types/vault";
import useOnUnmount from "~/utils/hooks/useOnUnmount";

const CARD_DEFAULT_VALUES: Card = {
  cardholderName: null,
  brand: null,
  number: null,
  expMonth: null,
  expYear: null,
  code: null,
};

const NO_BRAND_VALUE = "no-brand";
const NO_EXPIRATION_DATE_VALUE = "no-expiration-date";

function CardForm() {
  const { state, setField, defaultValues } = useFormContext<CreateItemPayload>();

  useOnUnmount(() => setField("card", defaultValues["card"]), []);

  const handleFieldChange =
    <TField extends keyof Card>(field: TField) =>
    (value: Card[TField]) => {
      setField("card", (card) => ({ ...CARD_DEFAULT_VALUES, ...card, [field]: value }));
    };

  const handleBrandChange = (value: string) => {
    handleFieldChange("brand")(value === NO_BRAND_VALUE ? null : CardBrand[value as keyof typeof CardBrand]);
  };

  return (
    <>
      <Form.TextField
        id="cardholderName"
        title="Cardholder name"
        value={state.card?.cardholderName ?? ""}
        onChange={handleFieldChange("cardholderName")}
      />
      <Form.Dropdown id="brand" title="Brand" value={state.card?.brand ?? NO_BRAND_VALUE} onChange={handleBrandChange}>
        <Form.Dropdown.Item value={NO_BRAND_VALUE} title="-- Select --" />
        {Object.entries(CARD_BRAND_TO_LABEL_MAP).map(([key, value]) => (
          <Form.Dropdown.Item key={key} value={key} title={value} />
        ))}
      </Form.Dropdown>
      <Form.TextField
        id="number"
        title="Number"
        value={state.card?.number ?? ""}
        onChange={handleFieldChange("number")}
      />
      <Form.Dropdown
        id="expMonth"
        title="Expiration month"
        value={state.card?.expMonth ?? NO_EXPIRATION_DATE_VALUE}
        onChange={handleFieldChange("expMonth")}
      >
        <Form.Dropdown.Item value={NO_EXPIRATION_DATE_VALUE} title="-- Select --" />
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
