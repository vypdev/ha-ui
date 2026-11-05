/** Pure inert presentation-text policy shared by component contracts. */
export function presentationText(value:unknown,maximum:number,empty=false):value is string {
  if (typeof value!=='string' || (!value.trim() && !(empty && value==='')) || Array.from(value).length>maximum) return false;
  return !/[\u0000-\u001f\u007f-\u009f\ud800-\udfff]/u.test(value);
}
