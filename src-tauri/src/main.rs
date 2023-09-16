use std::process::Command;
use std::env;

#[tauri::command]
fn open_executable(path: String) {
    //let executable_path = env::current_exe().expect("Failed to get current executable path");
    //let executable_directory = executable_path.parent().expect("Failed to get parent directory");
    //let executable_path = executable_directory.join(name);
    println!("Executable path: {:?}", path);

    let status = Command::new(&path)
        .spawn()
        .expect("Failed to run executable");

    // You can use the 'status' variable to check the result of the execution if needed.
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_executable
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}