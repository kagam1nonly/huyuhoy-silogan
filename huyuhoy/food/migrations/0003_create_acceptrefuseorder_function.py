# Generated migration to create PostgreSQL stored procedures

from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('food', '0002_alter_order_payment'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
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
                        -- Update the order status based on the action
                        IF action = 'Accept' THEN
                            UPDATE food_order
                            SET status = 'Processing'
                            WHERE id = order_id;
                            new_status := 'Accept';
                        ELSIF action = 'Refuse' THEN
                            UPDATE food_order
                            SET status = 'Canceled'
                            WHERE id = order_id;
                            new_status := 'Refuse';
                        ELSIF action = 'Complete' THEN
                            UPDATE food_order
                            SET status = 'Completed'
                            WHERE id = order_id;
                            new_status := 'Complete';
                        END IF;

                        RETURN QUERY SELECT ('Order ' || new_status || 'ed successfully')::TEXT;
                    ELSE
                        RETURN QUERY SELECT 'Order not found'::TEXT;
                    END IF;
                ELSE
                    RETURN QUERY SELECT 'Admin not authorized'::TEXT;
                END IF;
            END;
            $$ LANGUAGE plpgsql;
            """,
            reverse_sql="DROP FUNCTION IF EXISTS AcceptRefuseOrder(INT, VARCHAR, INT);"
        ),
        migrations.RunSQL(
            sql="""
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
            """,
            reverse_sql="DROP FUNCTION IF EXISTS CalculateTotalBillForCustomer(INT);"
        ),
        migrations.RunSQL(
            sql="""
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

                -- If payment doesn't exist, mark as failed
                IF payment_count = 0 THEN
                    UPDATE food_payment
                    SET payment_status = 'Failed'
                    WHERE id = p_payment_id;
                    RETURN QUERY SELECT 'Payment not found. Status updated to Failed'::TEXT;
                ELSE
                    -- Update the payment status to 'Paid'
                    UPDATE food_payment
                    SET payment_status = 'Paid'
                    WHERE id = p_payment_id;
                    RETURN QUERY SELECT 'Payment confirmed successfully'::TEXT;
                END IF;
            END;
            $$ LANGUAGE plpgsql;
            """,
            reverse_sql="DROP FUNCTION IF EXISTS ConfirmPayment(INT);"
        ),
    ]
