-- Functions

--Calculate the total number of customers
CREATE OR REPLACE FUNCTION CalculateTotalCustomers() 
RETURNS INT AS $$
DECLARE
    total_customers INT;
BEGIN
    SELECT COUNT(*) INTO total_customers FROM food_customuser WHERE is_superuser = FALSE;
    RETURN total_customers;
END;
$$ LANGUAGE plpgsql;

--Calculate the total ordered meals
CREATE OR REPLACE FUNCTION CalculateTotalOrderedMeals() 
RETURNS INT AS $$
DECLARE
    total_ordered_meals INT;
BEGIN
    SELECT COUNT(DISTINCT cartitem_id) INTO total_ordered_meals FROM food_cartitem;
    RETURN total_ordered_meals;
END;
$$ LANGUAGE plpgsql;

--Calculate the total revenue
CREATE OR REPLACE FUNCTION CalculateTotalRevenue() 
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total DECIMAL(10, 2);
BEGIN
    SELECT SUM(amount) INTO total FROM food_payment WHERE payment_status = 'Paid';
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Procedures

--Accept or refuse an order
CREATE OR REPLACE FUNCTION AcceptRefuseOrder(orderId INT, action VARCHAR(10), adminId INT)
RETURNS TEXT AS $$
DECLARE
    isAdmin INT;
    orderExists INT;
BEGIN
    -- Check if the admin exists and is authorized
    SELECT COUNT(*) INTO isAdmin
    FROM food_customuser
    WHERE id = adminId AND is_superuser = TRUE;

    IF isAdmin = 1 THEN
        -- Check if the order exists
        SELECT COUNT(*) INTO orderExists
        FROM food_order
        WHERE id = orderId;

        IF orderExists = 1 THEN
            -- Update the order status based on the action
            IF action = 'Accept' THEN
                UPDATE food_order
                SET status = 'Processing'
                WHERE id = orderId;
            ELSIF action = 'Refuse' THEN
                UPDATE food_order
                SET status = 'Canceled'
                WHERE id = orderId;
            ELSIF action = 'Complete' THEN
                UPDATE food_order
                SET status = 'Completed'
                WHERE id = orderId;
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

--Calculate the total bill for a customer
CREATE OR REPLACE FUNCTION CalculateTotalBillForCustomer(customerID INT)
RETURNS NUMERIC AS $$
DECLARE
    totalBill NUMERIC;
BEGIN
    SELECT COALESCE(SUM(bill), 0) INTO totalBill
    FROM food_order
    WHERE customer_id = customerID AND status = 'Processing';

    RETURN totalBill;
END;
$$ LANGUAGE plpgsql;

--Cancel a customer's order
CREATE OR REPLACE FUNCTION CancelCustomerOrder(orderNumber VARCHAR, customerID INT)
RETURNS TEXT AS $$
DECLARE
    orderExists INT;
BEGIN
    -- Check if the order exists and is owned by the customer
    SELECT COUNT(*) INTO orderExists
    FROM food_order
    WHERE number = orderNumber AND customer_id = customerID;

    IF orderExists = 1 THEN
        UPDATE food_order
        SET status = 'Canceled'
        WHERE number = orderNumber AND (status = 'Processing' OR status = 'Pending');

        RETURN 'Order canceled successfully';
    ELSE
        RETURN 'Order not found or you are not the owner';
    END IF;
END;
$$ LANGUAGE plpgsql;

--Confirm a payment
CREATE OR REPLACE FUNCTION ConfirmPayment(p_payment_id INT)
RETURNS TEXT AS $$
DECLARE
    payment_count INT;
BEGIN
    -- Check if the payment exists
    SELECT COUNT(*) INTO payment_count
    FROM food_payment
    WHERE id = p_payment_id;

    IF payment_count = 0 THEN
        -- Update the payment status to 'Failed'
        UPDATE food_payment
        SET payment_status = 'Failed'
        WHERE id = p_payment_id;

        RETURN 'Payment not found. Status updated to Failed';
    ELSE
        -- Update the payment status to 'Paid'
        UPDATE food_payment
        SET payment_status = 'Paid'
        WHERE id = p_payment_id;

        RETURN 'Payment confirmed successfully';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers

-- Delete associated payment when an order is deleted
CREATE OR REPLACE FUNCTION delete_associated_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete the payment associated with the deleted order
    DELETE FROM food_payment WHERE order_id = OLD.id;
    RETURN NULL; -- Triggers returning NULL prevent further processing
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_associated_payment_trigger
AFTER DELETE ON food_order
FOR EACH ROW
EXECUTE FUNCTION delete_associated_payment();

-- Delete associated order when a user is deleted
CREATE OR REPLACE FUNCTION delete_associated_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete the order associated with the deleted payment
    DELETE FROM food_order WHERE payment_id = OLD.id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_associated_order_trigger
AFTER DELETE ON food_payment
FOR EACH ROW
EXECUTE FUNCTION delete_associated_order();

-- Delete associated order and payment when a user is deleted
CREATE OR REPLACE FUNCTION delete_associated_order_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete orders associated with the deleted user
    DELETE FROM food_order WHERE customer_id = OLD.id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_associated_order_payment_trigger
AFTER DELETE ON food_customuser
FOR EACH ROW
EXECUTE FUNCTION delete_associated_order_payment();
