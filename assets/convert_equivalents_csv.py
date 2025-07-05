import csv
import sys
from datetime import datetime

def convert_csv_to_sql(csv_file_path, output_file_path):
    """
    Convert the equivalents CSV file to SQL INSERT statements
    """
    
    # SQL template for INSERT statements
    sql_template = """INSERT INTO public.sus_man_equivalents 
(id, category, scope, specification1, specification2, specification3, add_name1, comment, source, 
jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, "dec", avg_value, monthly_values, 
parent, project, "in", "out", import_ref, created_at, updated_at) 
VALUES 
('{}', '{}', {}, '{}', '{}', '{}', '{}', '{}', '{}', 
{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, 
{}, {}, '{}', '{}', '{}', '{}', '{}');"""

    def escape_sql_string(value):
        """Escape single quotes in SQL strings"""
        if value is None:
            return ''
        return str(value).replace("'", "''")
    
    def safe_float(value):
        """Convert string to float, return NULL if empty or invalid"""
        if value is None or value == '':
            return 'NULL'
        try:
            return float(value)
        except ValueError:
            return 'NULL'
    
    def safe_uuid(value):
        """Return UUID or NULL if empty"""
        if value is None or value == '':
            return 'NULL'
        return f"'{value}'"
    
    def safe_boolean(value):
        """Convert string to boolean"""
        if value is None or value == '':
            return 'false'
        try:
            return 'true' if int(value) == 1 else 'false'
        except ValueError:
            return 'false'

    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            # Read CSV with semicolon delimiter
            reader = csv.DictReader(csvfile, delimiter=';')
            
            sql_statements = []
            current_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            for row in reader:
                # Map CSV columns to SQL columns
                sql_statement = sql_template.format(
                    escape_sql_string(row['id']),                    # id
                    escape_sql_string(row['category']),              # category
                    int(row['scope']) if row['scope'] else 1,        # scope
                    escape_sql_string(row['specifikation1']),        # specification1
                    escape_sql_string(row['specifikation2']),        # specification2
                    escape_sql_string(row['specifikation3']),        # specification3
                    escape_sql_string(row['add_name1']),             # add_name1
                    escape_sql_string(row['comment']),               # comment
                    escape_sql_string(row['source']),                # source
                    safe_float(row['jan']),                          # jan
                    safe_float(row['feb']),                          # feb
                    safe_float(row['mar']),                          # mar
                    safe_float(row['apr']),                          # apr
                    safe_float(row['may']),                          # may
                    safe_float(row['jun']),                          # jun
                    safe_float(row['jul']),                          # jul
                    safe_float(row['aug']),                          # aug
                    safe_float(row['sep']),                          # sep
                    safe_float(row['oct']),                          # oct
                    safe_float(row['nov']),                          # nov
                    safe_float(row['dec']),                          # dec
                    safe_float(row['factor']),                       # avg_value
                    safe_boolean(row['monthly_values']),             # monthly_values
                    safe_uuid(row['parent']),                        # parent
                    safe_uuid(row['project']),                       # project
                    escape_sql_string(row['in']),                    # in
                    escape_sql_string(row['out']),                   # out
                    '',                                              # import_ref (empty)
                    current_timestamp,                               # created_at
                    current_timestamp                                # updated_at
                )
                
                sql_statements.append(sql_statement)
            
            # Write SQL statements to output file
            with open(output_file_path, 'w', encoding='utf-8') as outfile:
                outfile.write("-- Generated SQL INSERT statements for sus_man_equivalents\n")
                outfile.write("-- Generated on: {}\n\n".format(current_timestamp))
                outfile.write("BEGIN;\n\n")
                
                for statement in sql_statements:
                    outfile.write(statement + "\n\n")
                
                outfile.write("COMMIT;\n")
            
            print(f"Successfully converted {len(sql_statements)} records from {csv_file_path} to {output_file_path}")
            
    except FileNotFoundError:
        print(f"Error: File {csv_file_path} not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # Set file paths
    csv_file = "equivalents_with_guids.csv"
    output_file = "equivalents_insert_statements.sql"
    
    print("Converting CSV to SQL INSERT statements...")
    convert_csv_to_sql(csv_file, output_file)
    print("Conversion completed!") 