mod db;
mod commands;

use commands::*;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            vehicles::list_vehicles,
            vehicles::add_vehicle,
            vehicles::update_vehicle,
            vehicles::delete_vehicle,
            vehicles::reorder_vehicles,
            prices::list_prices,
            prices::add_price,
            prices::update_price,
            prices::delete_price,
            prices::reorder_prices,
            colors::list_colors,
            colors::add_color,
            colors::update_color,
            colors::delete_color,
            colors::reorder_colors,
            model_colors::list_model_colors,
            model_colors::add_model_color,
            model_colors::update_model_color,
            model_colors::delete_model_color,
            model_colors::reorder_model_colors,
            teams::list_teams,
            teams::add_team,
            teams::update_team,
            teams::delete_team,
            teams::reorder_teams,
            profile::get_profile,
            profile::update_profile,
            settings::list_settings,
            settings::update_setting,
            allocation_tables::list_allocation_tables,
            allocation_tables::add_allocation_table,
            allocation_tables::update_allocation_table,
            allocation_tables::delete_allocation_table,
            allocation_tables::reorder_allocation_tables,
            pull_outs::list_pull_outs,
            pull_outs::add_pull_out,
            pull_outs::update_pull_out,
            pull_outs::delete_pull_out,
            pull_outs::reorder_pull_outs,
            payments::list_payments,
            payments::add_payment,
            payments::update_payment,
            payments::delete_payment,
            payments::reorder_payments,
            next_cut_off::get_next_cut_off,
            next_cut_off::update_next_cut_off,
            inventory::list_inventory,
            inventory::add_inventory,
            inventory::update_inventory,
            inventory::delete_inventory,
            inventory::reorder_inventory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
