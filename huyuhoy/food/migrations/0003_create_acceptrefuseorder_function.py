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
                FROM auth_user
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
    -- FIRST, drop the existing function to allow the return type to be changed.
    DROP FUNCTION IF EXISTS AcceptRefuseOrder(INT, VARCHAR, INT); 
    
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
        FROM auth_user
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
    ]
