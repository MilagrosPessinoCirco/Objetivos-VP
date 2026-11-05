import * as React from 'react';
import { DatePicker, NormalPeoplePicker } from '@fluentui/react';
import styles from './Picker.module.scss';
import type { IPersonOption, IPickerProps } from './Picker.types';

let generatedPickerId = 0;

const spanishCalendarStrings = {
  months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  shortDays: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  goToToday: 'Ir a hoy',
  prevMonthAriaLabel: 'Mes anterior',
  nextMonthAriaLabel: 'Mes siguiente',
  prevYearAriaLabel: 'Año anterior',
  nextYearAriaLabel: 'Año siguiente',
  prevYearRangeAriaLabel: 'Rango de años anterior',
  nextYearRangeAriaLabel: 'Rango de años siguiente',
  closeButtonAriaLabel: 'Cerrar',
  selectedDateFormatString: 'Fecha seleccionada {0}',
  todayDateFormatString: 'Fecha de hoy {0}',
  monthPickerHeaderAriaLabel: '{0}, cambiar año',
  yearPickerHeaderAriaLabel: '{0}, cambiar mes',
  dayMarkedAriaLabel: 'marcado',
};

function twoDigits(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

function parseDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return undefined;
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return toIsoDate(date) === value ? date : undefined;
}

export const Picker: React.FC<IPickerProps> = ({
  mode,
  label = mode === 'date' ? 'Fecha' : 'Personas',
  placeholder = mode === 'date' ? 'Seleccionar fecha' : 'Seleccionar persona',
  value,
  defaultValue = '',
  people = [],
  selectedPeople,
  defaultSelectedPeople = [],
  open,
  darkMode = false,
  required = false,
  onChange,
  onOpenChange,
  onPersonSelect,
  onSelectedPeopleChange,
  className,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [internalSelected, setInternalSelected] = React.useState<IPersonOption[]>(defaultSelectedPeople);
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [generatedId] = React.useState(() => {
    generatedPickerId += 1;
    return `ds-picker-${generatedPickerId}`;
  });
  const currentValue = value === undefined ? internalValue : value;
  const isOpen = open === undefined ? internalOpen : open;
  const selectedDate = mode === 'date' ? parseDate(currentValue) : undefined;
  const setOpen = (next: boolean): void => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const setValue = (next: string): void => {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
    setOpen(false);
  };

  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const pickerLabelId = `${generatedId}-label`;
  const currentSelected = selectedPeople === undefined ? internalSelected : selectedPeople;
  const pickerPeople = people.map((person) => ({
    key: person.key,
    text: person.name,
    secondaryText: person.secondaryText,
    imageInitials: person.name.slice(0, 2).toUpperCase(),
  }));
  const selectedPickerPeople = currentSelected.map((person) => ({
    key: person.key,
    text: person.name,
    secondaryText: person.secondaryText,
    imageInitials: person.name.slice(0, 2).toUpperCase(),
  }));
  const setSelected = (next: IPersonOption[]): void => {
    if (selectedPeople === undefined) setInternalSelected(next);
    onSelectedPeopleChange?.(next);
  };
  const handlePersonSelect = (person: IPersonOption): void => {
    onPersonSelect?.(person);
    setSelected(currentSelected.concat([person]));
    if (value === undefined) setInternalValue('');
    onChange?.('');
    setOpen(false);
  };
  return (
    <div className={`${styles.picker} ${darkMode ? styles.dark : ''} ${isOpen ? styles.open : ''} ${className || ''}`}>
      {mode === 'people' && <label id={pickerLabelId} className={styles.label} htmlFor={generatedId}>{label}{required && <span className={styles.required}>*</span>}</label>}
      {mode === 'people' ? (
        <NormalPeoplePicker
          className={styles.peoplePicker}
          selectedItems={selectedPickerPeople}
          onResolveSuggestions={(filter, selectedItems) => pickerPeople.filter((person) =>
            !selectedItems?.some((selected) => selected.key === person.key) &&
            person.text.toLowerCase().indexOf(filter.toLowerCase()) >= 0,
          )}
          onEmptyResolveSuggestions={(selectedItems) => pickerPeople.filter((person) => !selectedItems?.some((selected) => selected.key === person.key))}
          onInputChange={(input) => {
            if (value === undefined) setInternalValue(input);
            onChange?.(input);
            return input;
          }}
          onChange={(items) => {
            const nextPeople = (items || []).map((item) => people.find((person) => person.key === String(item.key))).filter((person): person is IPersonOption => Boolean(person));
            const addedPerson = nextPeople.find((person) => currentSelected.every((selected) => selected.key !== person.key));
            if (addedPerson) onPersonSelect?.(addedPerson);
            setSelected(nextPeople);
          }}
          inputProps={{ id: generatedId, placeholder, 'aria-labelledby': pickerLabelId }}
          styles={{
            root: styles.peoplePickerRoot,
            text: styles.peoplePickerText,
            input: styles.peoplePickerInput,
          }}
        />
      ) : (
        <DatePicker
          id={generatedId}
          label={label}
          isRequired={required}
          placeholder={placeholder}
          value={selectedDate}
          strings={spanishCalendarStrings}
          disableAutoFocus
          calloutProps={{ shouldRestoreFocus: false, setInitialFocus: false }}
          formatDate={(date) => date ? toIsoDate(date) : ''}
          parseDateFromString={(date) => parseDate(date) || null}
          onSelectDate={(date) => {
            if (date) {
              setValue(toIsoDate(date));
            }
          }}
          styles={{
            root: styles.datePicker,
            textField: styles.datePickerTextField,
            icon: styles.datePickerIcon,
            callout: styles.datePickerCallout,
          }}
        />
      )}
    </div>
  );
};
