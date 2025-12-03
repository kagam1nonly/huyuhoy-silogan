# Generated migration to create PostgreSQL stored procedures
# This migration only runs on PostgreSQL, not on SQLite

from django.db import migrations

def create_postgres_functions(apps, schema_editor):
    """Only create functions if using PostgreSQL"""
    if schema_editor.connection.vendor != 'postgresql':
        return  # Skip for SQLite and other databases
    
    # AcceptRefuseOrder function
    schema_editor.execute("""
        CREATE OR REPLACE FUNCTION AcceptRefuseOrder(
            order_id INT,
            action VARCHAR,
            admin_id INT
        )
        RETURNS TABLE(result TEXT) AS $$
        DECLARE
            is_admin INT;
            order_exists INT;
            new_status VARCHAR;
            payment_status_check VARCHAR;
            payment_method_check VARCHAR;
            order_bill_amount NUMERIC;
        BEGIN
            -- Check if the admin exists and is authorized
            SELECT COUNT(*) INTO is_admin
            FROM food_customuser
            WHERE id = admin_id AND is_superuser = true;

            IF is_admin = 1 THEN
                -- Check if the order exists
                SELECT COUNT(*) INTO order_exists
                FROM food_order
                WHERE id = order_id;

                IF order_exists = 1 THEN
                    -- Check payment status if action is Accept or Complete
                    IF action = 'Accept' OR action = 'Complete' THEN
                        SELECT p.payment_status, p.method, o.bill
                        INTO payment_status_check, payment_method_check, order_bill_amount
                        FROM food_payment p
                        INNER JOIN food_order o ON o.payment_id = p.id
                        WHERE o.id = order_id;
                        
                        IF payment_status_check IS NULL THEN
                            RETURN QUERY SELECT 'No payment found for this order'::TEXT;
                            RETURN;
                        ELSIF payment_status_check != 'Paid' THEN
                            -- For Complete action with COD/CASH, auto-mark as Paid
                            IF action = 'Complete' AND payment_method_check IN ('COD', 'CASH') THEN
                                UPDATE food_payment
                                SET payment_status = 'Paid', amount = order_bill_amount
                                WHERE order_id = (SELECT payment_id FROM food_order WHERE id = order_id);
                            -- For GCASH or Accept action, payment must be confirmed first
                            ELSE
                                IF action = 'Accept' THEN
                                    RETURN QUERY SELECT 'Payment must be confirmed before accepting the order'::TEXT;
                                ELSE
                                    RETURN QUERY SELECT 'Payment must be confirmed before completing the order'::TEXT;
                                END IF;
                                RETURN;
                            END IF;
                        END IF;
                    END IF;
                    
                    -- Update the order status based on the action
                    IF action = 'Accept' THEN
                        UPDATE food_order
                        SET status = 'Processing'
                        WHERE id = order_id;
                        new_status := 'Accepted';
                    ELSIF action = 'Refuse' THEN
                        UPDATE food_order
                        SET status = 'Canceled'
                        WHERE id = order_id;
                        new_status := 'Refused';
                    ELSIF action = 'Complete' THEN
                        UPDATE food_order
                        SET status = 'Completed'
                        WHERE id = order_id;
                        new_status := 'Completed';
                    ELSE
                        RETURN QUERY SELECT 'Invalid action specified'::TEXT;
                        RETURN;
                    END IF;

                    RETURN QUERY SELECT ('Order ' || new_status || ' successfully')::TEXT;
                ELSE
                    RETURN QUERY SELECT 'Order not found'::TEXT;
                END IF;
            ELSE
                RETURN QUERY SELECT 'Admin not authorized'::TEXT;
            END IF;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    # CalculateTotalBillForCustomer function
    schema_editor.execute("""
        CREATE OR REPLACE FUNCTION CalculateTotalBillForCustomer(
            p_customer_id INT
        )
        RETURNS TABLE(total_bill NUMERIC) AS $$
        BEGIN
            RETURN QUERY
            SELECT COALESCE(SUM(bill), 0)::NUMERIC
            FROM food_order
            WHERE food_order.customer_id = p_customer_id AND status = 'Processing';
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    # ConfirmPayment function
    schema_editor.execute("""
        CREATE OR REPLACE FUNCTION ConfirmPayment(
            p_payment_id INT
        )
        RETURNS TABLE(result TEXT) AS $$
        DECLARE
            payment_count INT;
        BEGIN
            -- Check if the payment exists
            SELECT COUNT(*)
            INTO payment_count
            FROM food_payment
            WHERE id = p_payment_id;

            IF payment_count = 0 THEN
                RETURN QUERY SELECT 'Payment not found. Payment status not updated.'::TEXT;
            ELSE
                -- Update the payment status to 'Paid'
                UPDATE food_payment
                SET payment_status = 'Paid'
                WHERE id = p_payment_id;
                RETURN QUERY SELECT 'Payment confirmed successfully'::TEXT;
            END IF;
        END;
        $$ LANGUAGE plpgsql;
    """)

def drop_postgres_functions(apps, schema_editor):
    """Only drop functions if using PostgreSQL"""
    if schema_editor.connection.vendor != 'postgresql':
        return  # Skip for SQLite and other databases
    
    schema_editor.execute("DROP FUNCTION IF EXISTS AcceptRefuseOrder(INT, VARCHAR, INT);")
    schema_editor.execute("DROP FUNCTION IF EXISTS CalculateTotalBillForCustomer(INT);")
    schema_editor.execute("DROP FUNCTION IF EXISTS ConfirmPayment(INT);")

class Migration(migrations.Migration):

    dependencies = [
        ('food', '0002_alter_order_payment'),
    ]

    operations = [
        migrations.RunPython(create_postgres_functions, drop_postgres_functions),
    ]
