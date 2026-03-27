-- Run this in Supabase SQL Editor AFTER Django migrations are complete.

-- Calculate the total number of non-superuser customers
CREATE OR REPLACE FUNCTION calculatetotalcustomers()
RETURNS INT AS $$
DECLARE
    total_customers INT;
BEGIN
    SELECT COUNT(*) INTO total_customers
    FROM food_customuser
    WHERE is_superuser = FALSE;
    RETURN total_customers;
END;
$$ LANGUAGE plpgsql;

-- Calculate total ordered meals (cart lines)
CREATE OR REPLACE FUNCTION calculatetotalorderedmeals()
RETURNS INT AS $$
DECLARE
    total_ordered_meals INT;
BEGIN
    SELECT COUNT(DISTINCT cartitem_id) INTO total_ordered_meals
    FROM food_cartitem;
    RETURN total_ordered_meals;
END;
$$ LANGUAGE plpgsql;

-- Calculate total paid revenue
CREATE OR REPLACE FUNCTION calculatetotalrevenue()
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total
    FROM food_payment
    WHERE payment_status = 'Paid';
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Accept/refuse/complete an order
CREATE OR REPLACE FUNCTION acceptrefuseorder(orderid INT, action VARCHAR(10), adminid INT)
RETURNS TEXT AS $$
DECLARE
    is_admin INT;
    order_exists INT;
BEGIN
    SELECT COUNT(*) INTO is_admin
    FROM food_customuser
    WHERE id = adminid AND is_superuser = TRUE;

    IF is_admin = 1 THEN
        SELECT COUNT(*) INTO order_exists
        FROM food_order
        WHERE id = orderid;

        IF order_exists = 1 THEN
            IF action = 'Accept' THEN
                UPDATE food_order SET status = 'Processing' WHERE id = orderid;
            ELSIF action = 'Refuse' THEN
                UPDATE food_order SET status = 'Canceled' WHERE id = orderid;
            ELSIF action = 'Complete' THEN
                UPDATE food_order SET status = 'Completed' WHERE id = orderid;
            END IF;

            RETURN 'Order ' || action || 'ed successfully';
        ELSE
            RETURN 'Order not found';
        END IF;
    ELSE
        RETURN 'Admin not authorized';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Calculate total bill for a processing customer order set
CREATE OR REPLACE FUNCTION calculatetotalbillforcustomer(customerid INT)
RETURNS NUMERIC AS $$
DECLARE
    total_bill NUMERIC;
BEGIN
    SELECT COALESCE(SUM(bill), 0) INTO total_bill
    FROM food_order
    WHERE customer_id = customerid AND status = 'Processing';

    RETURN total_bill;
END;
$$ LANGUAGE plpgsql;

-- Cancel customer order
CREATE OR REPLACE FUNCTION cancelcustomerorder(ordernumber VARCHAR, customerid INT)
RETURNS TEXT AS $$
DECLARE
    order_exists INT;
BEGIN
    SELECT COUNT(*) INTO order_exists
    FROM food_order
    WHERE number = ordernumber AND customer_id = customerid;

    IF order_exists = 1 THEN
        UPDATE food_order
        SET status = 'Canceled'
        WHERE number = ordernumber AND (status = 'Processing' OR status = 'Pending');

        RETURN 'Order canceled successfully';
    ELSE
        RETURN 'Order not found or you are not the owner';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Confirm payment
CREATE OR REPLACE FUNCTION confirmpayment(p_payment_id INT)
RETURNS TEXT AS $$
DECLARE
    payment_count INT;
BEGIN
    SELECT COUNT(*) INTO payment_count
    FROM food_payment
    WHERE id = p_payment_id;

    IF payment_count = 0 THEN
        RETURN 'Payment not found';
    ELSE
        UPDATE food_payment
        SET payment_status = 'Paid'
        WHERE id = p_payment_id;

        RETURN 'Payment confirmed successfully';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger: delete associated payment when an order is deleted
CREATE OR REPLACE FUNCTION delete_associated_payment()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM food_payment WHERE order_id = OLD.id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS delete_associated_payment_trigger ON food_order;
CREATE TRIGGER delete_associated_payment_trigger
AFTER DELETE ON food_order
FOR EACH ROW
EXECUTE FUNCTION delete_associated_payment();

-- Trigger: delete associated order when a payment is deleted
CREATE OR REPLACE FUNCTION delete_associated_order()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM food_order WHERE payment_id = OLD.id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS delete_associated_order_trigger ON food_payment;
CREATE TRIGGER delete_associated_order_trigger
AFTER DELETE ON food_payment
FOR EACH ROW
EXECUTE FUNCTION delete_associated_order();

-- Trigger: delete associated orders/payment links when a user is deleted
CREATE OR REPLACE FUNCTION delete_associated_order_payment()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM food_order WHERE customer_id = OLD.id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS delete_associated_order_payment_trigger ON food_customuser;
CREATE TRIGGER delete_associated_order_payment_trigger
AFTER DELETE ON food_customuser
FOR EACH ROW
EXECUTE FUNCTION delete_associated_order_payment();
