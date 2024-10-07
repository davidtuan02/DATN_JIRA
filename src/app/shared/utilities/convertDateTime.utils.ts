import moment from 'moment';
import { DATE_FORMAT, DATE_PICKER_FORMATS } from '../components/common.const';

export const formatDateInstance = (date: any, format = DATE_PICKER_FORMATS.display.dateInput) =>  date ? moment(date).format(format) : null;
