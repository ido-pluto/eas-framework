use super::razor_syntax::Razor;
use crate::better_string::b_string::BetterString;
use std::collections::HashMap;
use lazy_static::lazy_static;

lazy_static!{
    static ref ADD_RAZOR: HashMap<String, String>= HashMap::from([("include".to_owned(), "await ".to_owned()), ("import".to_owned(), "await ".to_owned())]);
}

pub fn make_values(text: &str) -> (BetterString, Razor) {
    let text_as_better = BetterString::new(text);
    let mut data_builder = Razor::new();
    data_builder.builder(&text_as_better, 0);
    data_builder.optimize();
    (text_as_better, data_builder)
}

pub fn convert_ejs(text: &str) -> String {
    let (text_as_better, data_builder) = make_values(text);
    let mut re_build_text = String::new();

    for i in data_builder.values {
        let cut_text = text_as_better.substring(i.start, i.end).to_string();
        re_build_text += &match i.name.as_str() {
            "text" => cut_text,
            "script" => format!("<%{}%>", cut_text),
            "print" => format!("<%={}%>", cut_text),
            "escape" => format!("<%:{}%>", cut_text),
            _ => format!("<%{}{}%>", ADD_RAZOR.get(&i.name).unwrap(),cut_text)
        };
    }

    re_build_text
}

pub fn output_json(text: &str) -> String {
    let (_, data_builder) = make_values(text);

    serde_json::to_string(&data_builder.values).unwrap()
}